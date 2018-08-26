import { TestBed, inject } from '@angular/core/testing';

import { GitHubService } from './git-hub.service';
import { HttpClient } from '@angular/common/http';
import { cold, hot } from 'jasmine-marbles';

describe('GitHubService', () => {
    let service: GitHubService;
    let mockHttpService: any;

    // Pick properties of interest
    const mockRepos = [{
        'id': 2044029,
        'node_id': 'MDEwOlJlcG9zaXRvcnkyMDQ0MDI5',
        'name': 'astyanax',
        'full_name': 'Netflix/astyanax',
        'owner': {
            'login': 'Netflix',
            'id': 913567,
        },
        'forks_count': 374,
        'mirror_url': null,
    }, {
        'id': 2049379,
        'node_id': 'MDEwOlJlcG9zaXRvcnkyMDQ5Mzc5',
        'name': 'curator',
        'full_name': 'Netflix/curator',
        'owner': {
            'login': 'Netflix',
            'id': 913567,
        },
        'forks_count': 500,
        'mirror_url': null,
    }];

    const mockRepoResponse = {
        body: mockRepos,
        headers: {
            ok: true,
            status: 200,
            statusText: 'OK',
            type: 4,
            url: 'https://api.github.com/orgs/Netflix/repos'
        }
    };

    const mockEmptyRepoResponse = {
        body: [],
        headers: {
            ok: true,
            status: 200,
            statusText: 'OK',
            type: 4,
            url: 'https://api.github.com/orgs/Netflix/repos'
        }
    };

    const mockCommits = [{
        'sha': '7f5a0afc23aa5ff82320560a04d4c81a45efd67c',
        'node_id': 'MDY6Q29tbWl0Njc2NjU1ODo3ZjVhMGFmYzIzYWE1ZmY4MjMyMDU2MGEwNGQ0YzgxYTQ1ZWZkNjdj',
        'commit': {
            'author': {
                'name': 'Tim Bozarth',
                'email': 'tim@zarthsan.com',
                'date': '2018-05-04T22:36:18Z'
            },
            'committer': {
                'name': 'GitHub',
                'email': 'noreply@github.com',
                'date': '2018-05-04T22:36:18Z'
            },
            'message': 'Merge pull request #1797 from MenschNestor/master\n\nStabilize yet another test',
            'tree': {
                'sha': '76ead455df3f538c146e61f678fcf9a34721e018',
            },
            'comment_count': 0,
            'verification': {
                'verified': true,
                'reason': 'valid',
            }
        },
        'author': {
            'login': 'timbozo',
        },
        'committer': {
        },
        'parents': [
        ]
    }];

    beforeEach(() => {
        mockHttpService = jasmine.createSpyObj<GitHubService>('HttpClient', ['get']);
        TestBed.configureTestingModule({
            providers: [GitHubService,
                { provide: HttpClient, useValue: mockHttpService }]
        });
        service = TestBed.get(GitHubService);
    });

    it('should be created', inject([GitHubService], () => {
        expect(service).toBeTruthy();
    }));

    it('should get repos sorted by forks', () => {
        const mockRepos$ = cold('(x|)', { x: mockRepoResponse });
        (<jasmine.Spy>mockHttpService.get).and.returnValue(mockRepos$);
        const orderedRepos = [mockRepos[1], mockRepos[0]];
        const expected = cold('(x|)', { x: orderedRepos });
        expect(service.getRepos('Netflix')).toBeObservable(expected);
    });


    it('should handle empty repos response', () => {
        const mockRepos$ = cold('(x|)', { x: mockEmptyRepoResponse });
        (<jasmine.Spy>mockHttpService.get).and.returnValue(mockRepos$);
        const expected = cold('(x|)', { x: [] });
        expect(service.getRepos('Netflix')).toBeObservable(expected);
    });

    it('should get commits', () => {
        const mockCommits$ = cold('(x|)', { x: mockCommits });
        (<jasmine.Spy>mockHttpService.get).and.returnValue(mockCommits$);
        const expected = cold('(x|)', { x: mockCommits });
        expect(service.getCommits(mockRepos as any, 2049379)).toBeObservable(expected);
    });

    it('should throw error if invalid repo', () => {
        const mockCommits$ = cold('(x|)', { x: mockCommits });
        (<jasmine.Spy>mockHttpService.get).and.returnValue(mockCommits$);
        const expected = cold('#', null, 'Invalid repo');
        expect(service.getCommits(mockRepos as any, 999)).toBeObservable(expected);
    });
});
