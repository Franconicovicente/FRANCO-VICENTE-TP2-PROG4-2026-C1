import { Component, input, output } from '@angular/core';
import { Post } from '../../../../core/models/post.model';

@Component({
  selector: 'app-post-card',
  standalone: true,
  templateUrl: './post-card.html',
  styleUrls: ['./post-card.css']
})
export class PostCardComponent {
  post = input.required<Post>();
  likeToggled = output<string>();

  onLikeClick(): void {
    this.likeToggled.emit(this.post().id);
  }
}