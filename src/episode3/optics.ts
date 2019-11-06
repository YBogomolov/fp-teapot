import { array } from 'fp-ts/lib/Array';
import { none, Option, some } from 'fp-ts/lib/Option';
import { make, tree, Tree } from 'fp-ts/lib/Tree';
import { fromTraversable, Lens, Optional } from 'monocle-ts';

interface User {
  name: string;
  login: string;
  posts: Post[];
}

interface Post {
  title: string;
  tags: string[];
  comments: Option<Tree<PostComment>>;
  attachment: Option<Blob>;
}

interface PostComment {
  date: Date;
  text: string;
  authorName: string;
  attachment: Option<Blob>;
}

const exampleData: User[] = [
  {
    name: 'Yuriy',
    login: 'yuriy',
    posts: [
      {
        title: 'First post',
        tags: ['first', 'post'],
        comments: some(make(
          {
            date: new Date(2019, 0, 1, 0, 0, 0, 0),
            text: 'Cool post!',
            authorName: 'Vasiliy',
            attachment: none,
          },
          [
            tree.of({
              date: new Date(2019, 0, 2, 0, 0, 0, 0),
              text: 'and even better comment, my dude',
              authorName: 'Egor',
              attachment: none,
            }),
          ],
        )),
        attachment: none,
      },
    ],
  },
];

const capitalizeWord = (word: string) => word[0].toLocaleUpperCase() + word.substr(1).toLocaleLowerCase();
const capitalize = (title: string) => title.split(' ').map(capitalizeWord).join(' ');

// Non-optics example:
/*
const modifiedDataImperative = exampleData.map(
  (user) => ({
    ...user,
    posts: user.posts.map(
      (post) => ({
        ...post,
        ...(post.attachment != null ? { attachment: post.attachment } : {}),
        comments: tree.map(
          post.comments,
          (comment) => ({
            ...comment,
            ...(comment.attachment != null ? { attachment: comment.attachment } : {}),
            text: capitalize(comment.text),
          }),
        ),
      }),
    ),
  }),
);

console.dir({ modifiedDataImperative }, { depth: null });
/**/
// Optics example:

const usersTraversal = fromTraversable(array)<User>();
const postsLens = Lens.fromProp<User>()('posts');
const postTraversal = fromTraversable(array)<Post>();
const commentsOptional = Optional.fromOptionProp<Post>()('comments');
const commentTraversal = fromTraversable(tree)<PostComment>();
const textLens = Lens.fromProp<PostComment>()('text');

const usersTextTraversal = usersTraversal
  .composeLens(postsLens)
  .composeTraversal(postTraversal)
  .composeOptional(commentsOptional)
  .composeTraversal(commentTraversal)
  .composeLens(textLens);

const modifiedDataOptics = usersTextTraversal.modify(capitalize)(exampleData);

console.dir({ modifiedDataOptics }, { depth: null });
