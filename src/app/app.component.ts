import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, zip } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface Post {
  id: number;
  title: string;
  userId: number;
  body: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  showAllPosts: boolean = true;
  posts$: Observable<Post[]>;
  filteredPosts$: Observable<Post[]>;
  filter$: Observable<string>;
  favourites: number[];

  postsLoading: boolean = true;
  initialPostsQueryHandler: any;

  controlPanel = new FormGroup({
    filterInput: new FormControl(''),
    userIdInput: new FormControl('', [
      Validators.min(2),
      Validators.max(10)
    ])
  });

  constructor(private httpClient: HttpClient) {
  }

  ngOnInit(): void {
    this.posts$ = this.httpClient.get<Post[]>('https://jsonplaceholder.typicode.com/posts?userId=1')
    this.initialPostsQueryHandler = this.posts$.subscribe(() => this.postsLoading = false);
    this.filter$ = this.controlPanel.get('filterInput').valueChanges.pipe(startWith(''));
    this.filteredPosts$ = combineLatest(this.posts$, this.filter$).pipe(
      map(([posts, filterString]) => posts.filter(post => this.showAllPosts ? post.title.indexOf(filterString) !== -1 :
        post.title.indexOf(filterString) !== -1 && this.favourites.includes(post.id)))
    );

    this.favourites = window.localStorage.getItem('favourites') ? JSON.parse(window.localStorage.getItem('favourites')) : [];
  }

  ngOnDestroy(): void {
    this.initialPostsQueryHandler.unsubscribe();
  }

  get id() {
    return this.controlPanel.get('userIdInput');
  }

  switchDisplayMode(): void {
    this.showAllPosts = !this.showAllPosts;
    this.controlPanel.get('filterInput').updateValueAndValidity({ onlySelf: false, emitEvent: true });
  }

  switchFavouriteValue(id: number): void {
    if (this.favourites.includes(id))
      this.favourites = this.favourites.filter(it => it != id);
    else
      this.favourites.push(id);

    window.localStorage.setItem('favourites', JSON.stringify(this.favourites));
    this.controlPanel.get('filterInput').updateValueAndValidity({ onlySelf: false, emitEvent: true });
  }

  uploadNewPosts(): void {
    this.postsLoading = true;
    let id = this.controlPanel.get('userIdInput').value;
    let newPosts$ = this.httpClient.get<Array<Post>>('https://jsonplaceholder.typicode.com/posts?userId=' + id);
    this.posts$ = zip(this.posts$, newPosts$).pipe(map(x => x[0].concat(x[1])));
    let uploadFinishHandler = this.posts$.subscribe(() => {
      this.postsLoading = false;
      this.filteredPosts$ = combineLatest(this.posts$, this.filter$).pipe(
        map(([posts, filterString]) => posts.filter(post => this.showAllPosts ? post.title.indexOf(filterString) !== -1 :
          post.title.indexOf(filterString) !== -1 && this.favourites.includes(post.id))),
      );
      uploadFinishHandler.unsubscribe();
    });
  }

  isUploadBtnDisabled(): boolean {
    return this.id.invalid || !this.id.value || this.id.value == '' || this.postsLoading;
  }

}
