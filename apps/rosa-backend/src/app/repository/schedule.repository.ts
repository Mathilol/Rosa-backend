import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Schedule} from "../object/schema/schedule";

@Injectable()
export class ScheduleRepository {
  constructor(@InjectModel(Schedule.name) private scheduleModel: Model<Schedule>) {
  }

  public findAllForHP(healthProfessionalId: number): Promise<Schedule[]> {
    return this.scheduleModel.find(
      {
        healthProfessionalId:  healthProfessionalId
      }
    ).exec();
  }

  public findAll(): Promise<Schedule[]>{
    return this.scheduleModel.find().exec();
  }
}
