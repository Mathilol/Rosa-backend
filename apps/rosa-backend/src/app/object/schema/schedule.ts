import {Prop, SchemaFactory, Schema} from "@nestjs/mongoose";
import {DaysType} from "../days";

@Schema({ collection: 'schedule' })
export class Schedule {
  @Prop() days: DaysType[];
  @Prop() startTime: String;
  @Prop() endTime: String;
  @Prop() healthProfessionalId: number;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
