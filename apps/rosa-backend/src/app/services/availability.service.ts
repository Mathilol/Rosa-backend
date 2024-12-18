import {Injectable} from "@nestjs/common";
import {AppointmentRepository} from "../repository/appointment.repository";
import {ScheduleRepository} from "../repository/schedule.repository";
import {Schedule} from "../object/schema/schedule";
import {AvailabilityDto} from "../object/dto/availability.dto";
import {
  addDays,
  isBefore,
  isAfter,
  differenceInMinutes,
  addMinutes,
  addYears,
} from 'date-fns';
import {Days} from "../object/days";
import {Availability} from "../object/availability";
import {Appointment} from "../object/schema/appointment";

@Injectable()
export class AvailabilityService {
  constructor(private readonly appointmentRepository: AppointmentRepository,
              private readonly scheduleRepository: ScheduleRepository) {
  }


  public async getAvailabilities(from: Date, to: Date): Promise<AvailabilityDto[]> {
    const schedules: Schedule[] = await this.scheduleRepository.findAllForHP(1);
    const appointments: Appointment[] = await this.appointmentRepository.findAllForHP(1, from, to);
    let availabilityDtos: AvailabilityDto[] = this.calculateAvailabilitiesFromSchedules(from, to, schedules);

    appointments.forEach(app => {
      availabilityDtos.forEach(availabilityDto => {
        availabilityDto.availabilities = availabilityDto.availabilities.flatMap(availability => {
          if (isAfter(app.startDate, availability.startDate) && isBefore(app.startDate, availability.endDate)) {
            const dates = [{startDate: availability.startDate, endDate: app.startDate}];

            if (isBefore(app.endDate, availability.endDate)) {
              dates.push({startDate: app.endDate, endDate: availability.endDate})
            }

            return dates
          } else if (isAfter(app.endDate, availability.startDate) && isBefore(app.endDate, availability.endDate)) {
            const dates = [{startDate: app.endDate, endDate: availability.endDate}];

            if (isAfter(app.startDate, availability.startDate)) {
              dates.unshift({startDate: availability.startDate, endDate: app.startDate})
            }
            return dates
          } else if (isBefore(app.startDate, availability.startDate) && isAfter(app.endDate, availability.endDate)) {
            return []
          }
          return [availability];
        })
      })
    })

    availabilityDtos.forEach(availabilityDto => {
      availabilityDto.availabilities = availabilityDto.availabilities.flatMap(availability => this.splitAvailability(availability, 15))
    })

    return availabilityDtos;
  }

  public async getNextAvailability(from: Date): Promise<Availability | undefined> {
    let date = from;
    const maxDate = addYears(from, 1);

    while (isBefore(date, maxDate)) {
      const availabilitesDtos = await this.getAvailabilities(date, addDays(date, 7));
      const availabilites: Availability[] = availabilitesDtos.flatMap(a => a.availabilities);

      if (availabilites.length > 0) {
        return availabilites.reduce((previousValue, newValue) => isAfter(newValue.startDate, previousValue.startDate) ? previousValue : newValue);
      }
    }

    return;
  }

  private calculateAvailabilitiesFromSchedules(fromDate: Date, endDate: Date, schedules: Schedule[]): AvailabilityDto[] {
    const availabilityDtos: AvailabilityDto[] = [];

    let currentDate = fromDate;
    while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
      const schedule = schedules.find(s => s.days.includes(Days[currentDate.getDay()]))
      if (schedule) {
        availabilityDtos.push({
          availabilities: [{
            startDate: new Date(`${currentDate.toISOString().slice(0, 10)}T${schedule.startTime}:00`),
            endDate: new Date(`${currentDate.toISOString().slice(0, 10)}T${schedule.endTime}:00`)
          }],
          date: currentDate
        });
      }
      currentDate = addDays(currentDate, 1);
    }
    return availabilityDtos;
  }

  private splitAvailability(availability: Availability, chunkSize: number): Availability[] {
    const availabilities: Availability[] = [];
    const totalMinutes = differenceInMinutes(availability.endDate, availability.startDate);
    const numberOfChunks = Math.floor(totalMinutes / chunkSize);

    for (let i = 0; i < numberOfChunks; i++) {
      const start = addMinutes(availability.startDate, i * chunkSize);
      const end = addMinutes(start, chunkSize);
      availabilities.push({startDate: start, endDate: end});
    }

    return availabilities;
  }
}
