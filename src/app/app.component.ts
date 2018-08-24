import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatSelectionList, MatSelectionListChange, MatListOption, MatSelectChange, MatSelect } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { map, flatMap, switchMap, catchError, tap } from 'rxjs/operators';
import { find, orderBy, first, each } from 'lodash';
import { Repo } from './Repo';
import { fromEvent, Subject, Observable, merge, empty, Subscription } from 'rxjs';
import { GitHubService } from './git-hub-service/git-hub.service';

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
    // Should use fromEvent to map click/selection events to observables
    // but cant get selectionChange to work with MatOption
    // As a workaround, maintain and 'next' a subject
    // The boolean flag is used to differentiate button click of
    // the submit button versus the selectionChange of the
    // repos dropdown
    private fetchSubject: Subject<Boolean> = new Subject();
    private subscription: Subscription;

    @ViewChild(MatSelect) reposList: MatSelect;

    constructor(private httpClient: HttpClient, private gitHubService: GitHubService) {
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
        return this.gitHubService.getRepos(this.orgName).pipe(
            map((repos) => {
                this.repos = repos;
                this.selectedRepoId = first(this.repos).id;
                return repos;
            }),
            catchError(() => {
                this.repos = null;
                this.commits = null;
                return empty();
            })
        );
    }

    getCommits() {
        return this.gitHubService.getCommits(this.repos, this.selectedRepoId).pipe(
            tap(c => this.commits = c),
            catchError(() => {
                this.commits = null;
                return empty();
            })
        );
    }
}
