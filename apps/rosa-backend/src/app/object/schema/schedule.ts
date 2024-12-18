import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Days } from '../days';

@Schema({ collection: 'schedule' })
export class Schedule {
  @Prop() days: Days[];
  @Prop() startTime: String;
  @Prop() endTime: String;
  @Prop() healthProfessionalId: number;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
