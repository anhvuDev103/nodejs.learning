import { ObjectId } from 'mongodb';

interface FollowerType {
  _id?: ObjectId;
  user_id: ObjectId;
  followed_user_id: ObjectId;
  created_at?: Date;
}

class Follower {
  _id: ObjectId;
  user_id: ObjectId;
  followed_user_id: ObjectId;
  created_at: Date;

  constructor(payload: FollowerType) {
    this._id = payload._id || new ObjectId();
    this.user_id = payload.user_id;
    this.followed_user_id = payload.followed_user_id;
    this.created_at = payload.created_at || new Date();
  }
}

export default Follower;
