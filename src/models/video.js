import {mongoose, Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    title:{
        type:String,
        reuired: true
    },
    file:{
        type:String,
        reuired: true
    },
    thumbnail:{
        type:String,
        reuired: true
    },
    description:{
        type:String,
        reuired: true
    },
    duration:{
        type:Number,
        reuired: true
    },
    views:{
        type:Number,
        default:0
    },
    isLive:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
}, {timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)