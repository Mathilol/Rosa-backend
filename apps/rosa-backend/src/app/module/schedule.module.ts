import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {Schedule, ScheduleSchema} from "../object/schema/schedule";
import {ScheduleRepository} from "../repository/schedule.repository";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Schedule.name, schema: ScheduleSchema }])],
  providers: [
    ScheduleRepository
  ],
  exports: [
    ScheduleRepository
  ]
})
export class ScheduleModule {}
