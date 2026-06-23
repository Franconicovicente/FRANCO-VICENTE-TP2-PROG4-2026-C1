import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ required: true, trim: true })
  titulo!: string;

  @Prop({ required: true, trim: true })
  descripcion!: string;

  @Prop({ default: '' })
  imagenUrl!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor!: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes!: Types.ObjectId[];

  @Prop({ default: false })
  eliminado!: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);