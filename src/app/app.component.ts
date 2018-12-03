import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatSelectionList, MatSelectionListChange, MatListOption, MatSelectChange, MatSelect } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { map, flatMap, switchMap, catchError, tap, bufferCount, take } from 'rxjs/operators';
import { find, orderBy, first, each } from 'lodash';
import { Repo } from './Repo';
import { CommitInfo } from './Commit';
import { fromEvent, Subject, Observable, merge, empty, Subscription } from 'rxjs';
import { GitHubService } from './git-hub-service/git-hub.service';

enum ViewState {
    Loading,
    Ready,
    Error
}

// test ghub desktop

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
    viewState: typeof ViewState = ViewState;
    activeView: ViewState;
    repos: Array<Repo> = [];
    commits: Array<CommitInfo> = [];
    columnsToDisplay = ['commitMessage', 'commitAuthor', 'commitDate'];
    orgName = '';
    selectedRepoId = -1;
    // Should use 'fromEvent' to map click/selection events to observables
    // but cant get selectionChange to work with MatOption
    // As a workaround, emit 'next' on a subject to simulate the same.
    // The boolean flag is used to differentiate between button click of
    // the submit button and the selectionChange of the
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
                this.activeView = ViewState.Loading;
                return x === true ? this.getReposAndCommits() : this.getCommits();
            })).subscribe(
                () => {
                    console.log('Got commits');
                    this.activeView = ViewState.Ready;
                },
                (e) => {
                    console.error('Error fetching', e);
                    this.activeView = ViewState.Error;
                }
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

    private getReposAndCommits(): Observable<Array<CommitInfo>> {
        return this.getRepos().pipe(
            flatMap(_ => this.getCommits())
        );
    }

    private getRepos(): Observable<Array<Repo>> {
        return this.gitHubService.getRepos(this.orgName).pipe(
            map((repos) => {
                this.repos = repos;
                this.selectedRepoId = first(this.repos).id;
                return repos;
            }),
            catchError((e) => {
                console.error('Error getting repos', e);
                this.activeView = ViewState.Error;
                return empty();
            })
        );
    }

    private getCommits(): Observable<Array<CommitInfo>> {
        return this.gitHubService.getCommits(this.repos, this.selectedRepoId).pipe(
            tap(c => this.commits = c),
            catchError((e) => {
                console.error('Error getting commits', e);
                this.activeView = ViewState.Error;
                return empty();
            })
        );
    }
}
