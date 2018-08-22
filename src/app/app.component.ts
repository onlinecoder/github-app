import { Component, ViewChild, OnInit } from '@angular/core';
import { MatSelectionList, MatSelectionListChange, MatListOption } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { find, orderBy } from 'lodash';
import { Repo} from './Repo';

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

  @ViewChild(MatSelectionList) reposList: MatSelectionList;

  constructor(private httpClient: HttpClient) {
  }

  onSelectionChange(event: MatSelectionListChange) {
    console.info('GOT CHANGE EVT', event.option.value);
    const selectedRepo = find( this.repos, (repo) => repo.id === event.option.value);
    const url = `https://api.github.com/repos/${selectedRepo.owner.login}/${selectedRepo.name}/commits`;
    this.httpClient.get<any>(url).pipe(
        map((x) => {
            this.commits = x;
            return x;
    })).subscribe(
        resp => {
            console.info('got commits', resp);
        }
    );
  }
//https://api.github.com/organizations/913567/repos?page=5
  ngOnInit() {
    this.reposList.selectedOptions = new SelectionModel<MatListOption>(false);
    this.httpClient.get<Array<Repo>>('https://api.github.com/orgs/Netflix/repos', {
    // this.httpClient.get<Array<Repo>>('https://api.github.com/organizations/913567/repos?page=5', {
        observe: 'response'
    }).pipe(
        map((repos) => {
            this.repos = orderBy(repos.body, ['forks'], ['desc']);
            return repos;
    })).subscribe(
        resp =>  {
            console.log(resp.headers.get('Link'));
            console.info('got resp', resp);
        }
    );
  }

}
