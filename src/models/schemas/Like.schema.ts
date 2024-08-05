import { ObjectId } from 'mongodb';

interface LikeType {
  _id?: ObjectId;
  user_id: ObjectId;
  tweet_id: ObjectId;
  created_at?: Date;
}

class Like {
  _id: ObjectId;
  user_id: ObjectId;
  tweet_id: ObjectId;
  created_at: Date;

  constructor(bookmark: LikeType) {
    this._id = bookmark._id || new ObjectId();
    this.user_id = bookmark.user_id;
    this.tweet_id = bookmark.tweet_id;
    this.created_at = bookmark.created_at || new Date();
  }
}

export default Like;
