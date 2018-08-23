import { Component, ViewChild, OnInit } from '@angular/core';
import { MatSelectionList, MatSelectionListChange, MatListOption, MatSelectChange, MatSelect } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { map, flatMap, switchMap, catchError, tap} from 'rxjs/operators';
import { find, orderBy, first } from 'lodash';
import { Repo} from './Repo';
import { fromEvent, Subject, Observable, merge, empty } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  repos: Array<Repo>;
  commits: Array<Commit>;
  columnsToDisplay = ['commitMessage', 'commitAuthor'];
  orgName = 'NVIDIA';
  selectedRepoId = -1;
  private fetchSubject: Subject<Boolean> = new Subject();

  @ViewChild(MatSelect) reposList: MatSelect;

  constructor(private httpClient: HttpClient) {
    // this.repos = [
    //     {id: 1, name: 'nvidia'},
    //     {id: 5, name: 'foobar'}
    // ];
    // this.selectedRepoId = 1;
  }

  onSelectionChange(event: MatSelectChange) {
    console.info('GOT CHANGE EVT', event.value);
    this.selectedRepoId = event.value;
    this.fetchSubject.next(false);
  }

  ngOnInit() {
    this.fetchSubject.pipe(
        switchMap((x) => {
            const git$ = x === true ? this.getReposAndCommits() : this.getCommits();
            return git$.pipe(
               // catchError(() => empty())
            );
        })).subscribe(() => console.log('GOT COMMITS'));
    this.fetchSubject.next(true);

  }

  onGetRepos() {
    this.fetchSubject.next(true);
  }

  getReposAndCommits() {
    return this.getRepos().pipe(
        tap(x => console.log('before calling commits')),
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
    const selectedRepo = find( this.repos, (repo) => repo.id === this.selectedRepoId);
    console.info('Getting COMMITS', selectedRepo.owner.login, selectedRepo.name);
    const url = `https://api.github.com/repos/${selectedRepo.owner.login}/${selectedRepo.name}/commits`;
    return this.httpClient.get<any>(url).pipe(
        map((x) => {
            this.commits = x;
            return x;
        }),
        catchError(() => {
            this.commits = [];
            return empty();
        })
    );
  }
}
