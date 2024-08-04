import { ObjectId } from 'mongodb';

interface HashtagType {
  _id?: ObjectId;
  name: string;
  created_at?: Date;
}

class Hashtag {
  _id: ObjectId;
  name: string;
  created_at: Date;

  constructor(hashtag: HashtagType) {
    this._id = hashtag._id || new ObjectId();
    this.name = hashtag.name;
    this.created_at = hashtag.created_at || new Date();
  }
}

export default Hashtag;
