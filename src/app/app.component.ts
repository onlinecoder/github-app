import { Component, ViewChild, OnInit } from '@angular/core';
import { MatSelectionList, MatSelectionListChange, MatListOption } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Repo} from './Repo';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  projects: Array<Repo>;
  @ViewChild(MatSelectionList) projectsList: MatSelectionList;

  constructor(private httpClient: HttpClient) {
  }

  onSelectionChange(event: MatSelectionListChange) {
    console.info('GOT CHANGE EVT', event.option.value);
    //console.info('GOT CHANGE EVT****************', v);
    // GET /repos/:owner/:repo/commits
    const selectedRepo = this.projects[event.option.value];
    this.httpClient.get<any>(selectedRepo.commits_url).pipe(
        map((x) => {

        return x;
    })).subscribe(
        x => console.info('got commits', x)
    );
  }

  ngOnInit() {
    this.projectsList.selectedOptions = new SelectionModel<MatListOption>(false);
    this.httpClient.get<Array<Repo>>('https://api.github.com/orgs/Netflix/repos').pipe(
        map((x) => {
            this.projects = x;
            return x;
    })).subscribe(
        x => console.info('got resp', x)
    );
  }

}
