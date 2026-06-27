import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment extends Document {
  @Prop({ required: true, trim: true })
  mensaje!: string;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  publicacion!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor!: Types.ObjectId;

  @Prop({ default: false })
  modificado!: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);