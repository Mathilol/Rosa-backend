import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Appointment} from "../object/schema/appointment";
import {endOfDay, startOfDay} from "date-fns";

@Injectable()
export class AppointmentRepository {
  constructor(@InjectModel(Appointment.name) private appointmentModel: Model<Appointment>) {
  }

  public findAllForHP(healthProfessionalId: number, from: Date, to: Date): Promise<Appointment[]> {
    const start: Date = startOfDay(new Date(from));
    const end: Date = endOfDay(new Date(to));

    return this.appointmentModel.find(
      {
        healthProfessionalId: healthProfessionalId,
        $or: [{
          startDate: {$gte: start, $lte: end},
          },
          {
            endDate: {$gte: start, $lte: end}
          }]
      }
    ).exec();
  }
}
