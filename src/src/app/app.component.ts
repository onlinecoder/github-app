import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatSelectionList, MatSelectionListChange, MatListOption, MatSelectChange, MatSelect } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { map, flatMap, switchMap, catchError, tap } from 'rxjs/operators';
import { find, orderBy, first, each } from 'lodash';
import { Repo } from './Repo';
import { fromEvent, Subject, Observable, merge, empty, Subscription } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'app';
    repos: Array<Repo> = [];
    commits: Array<Commit> = [];
    columnsToDisplay = ['commitMessage', 'commitAuthor', 'commitDate'];
    orgName = 'Netflix';
    selectedRepoId = -1;
    private fetchSubject: Subject<Boolean> = new Subject();
    private subscription: Subscription;

    @ViewChild(MatSelect) reposList: MatSelect;

    constructor(private httpClient: HttpClient) {
    }

    onSelectionChange(event: MatSelectChange) {
        this.selectedRepoId = event.value;
        this.fetchSubject.next(false);
    }

    ngOnInit() {
        this.subscription = this.fetchSubject.pipe(
            switchMap((x) => {
                return x === true ? this.getReposAndCommits() : this.getCommits();
            })).subscribe(
                () => console.log('Got commits'),
                (e) => console.error('Error fetching', e)
            );

    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    onGetRepos() {
        this.fetchSubject.next(true);
    }

    getReposAndCommits() {
        return this.getRepos().pipe(
            flatMap(_ => this.getCommits())
        );
    }

    getRepos() {
        return this.httpClient.get<Array<Repo>>(`https://api.github.com/orgs/${this.orgName}/repos`, {
            // this.httpClient.get<Array<Repo>>('https://api.github.com/organizations/913567/repos?page=5', {
            observe: 'response'
        }).pipe(
            map((repos) => {
                this.repos = orderBy(repos.body, ['forks'], ['desc']);
                this.selectedRepoId = first(this.repos).id;
                return repos;
            }),
            catchError(() => {
                this.repos = [];
                this.commits = [];
                return empty();
            })
        );
    }

    getCommits() {
        const selectedRepo = find(this.repos, (repo) => repo.id === this.selectedRepoId);
        console.info('Getting COMMITS', selectedRepo.owner.login, selectedRepo.name);
        const url = `https://api.github.com/repos/${selectedRepo.owner.login}/${selectedRepo.name}/commits`;
        return this.httpClient.get<any>(url).pipe(
            map((commits) => {

                each(commits, (c) => {
                    console.info('C IS', c);
                    c.commit.message = c.commit.message.slice(0, 100);
                    // return c;
                });
                this.commits = commits;
                return commits;
            }),
            catchError(() => {
                this.commits = [];
                return empty();
            })
        );
    }
}
