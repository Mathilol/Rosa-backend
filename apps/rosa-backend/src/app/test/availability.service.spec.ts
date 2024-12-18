import {Test, TestingModule} from '@nestjs/testing';
import {addDays} from 'date-fns';
import {AvailabilityService} from "../services/availability.service";
import {Schedule} from "../object/schema/schedule";
import {AppointmentRepository} from "../repository/appointment.repository";
import {ScheduleRepository} from "../repository/schedule.repository";
import {Appointment} from "../object/schema/appointment";
import {AvailabilityDto} from "../object/dto/availability.dto";
import {Availability} from "../object/availability";

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  const appointmentMock = {
    findAllForHP: jest.fn(),
  };
  const scheduleMock = {
    findAllForHP: jest.fn(),
  };
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: AppointmentRepository,
          useValue: appointmentMock,
        },
        {
          provide: ScheduleRepository,
          useValue: scheduleMock,
        },
      ],
    }).compile();

    service = module.get<AvailabilityService, AvailabilityService>(AvailabilityService);
  });

  beforeEach(async () => {
    jest.resetAllMocks();
  })

  describe('getAvailabilities', () => {
    it('should return a list of availabilities depending on the schedule and appointments of the health professional', async () => {
      const from = new Date("2024-12-08T12:00:00");
      const to = addDays(from, 14);
      const schedules: Schedule[] = [
        {
          days: ["Monday"],
          startTime: "10:00",
          endTime: "12:00",
          healthProfessionalId: 1
        },
        {
          days: ["Friday"],
          startTime: "13:00",
          endTime: "14:00",
          healthProfessionalId: 1
        }
      ];
      const appointments: Appointment[] = [
        {
          startDate: new Date("2024-12-09T09:00:00"),
          endDate: new Date("2024-12-09T11:00:00"),
          healthProfessionalId: 1
        }, {
          startDate: new Date("2024-12-09T11:30:00"),
          endDate: new Date("2024-12-09T13:00:00"),
          healthProfessionalId: 1
        }, {
          startDate: new Date("2024-12-13T13:20:00"),
          endDate: new Date("2024-12-13T13:40:00"),
          healthProfessionalId: 1
        }, {
          startDate: new Date("2024-12-16T08:00:00"),
          endDate: new Date("2024-12-16T19:00:00"),
          healthProfessionalId: 1
        }, {
          startDate: new Date("2024-12-20T07:00:00"),
          endDate: new Date("2024-12-20T08:00:00"),
          healthProfessionalId: 1
        }
      ];

      scheduleMock.findAllForHP.mockResolvedValue(schedules);
      appointmentMock.findAllForHP.mockResolvedValue(appointments);

      const result: AvailabilityDto[] = await service.getAvailabilities(from, to);
      expect(result).toBeInstanceOf(Array);
      const expectedResult: AvailabilityDto[] = [
        {
          availabilities: [
            {
              startDate: new Date("2024-12-09T11:00:00"),
              endDate: new Date("2024-12-09T11:15:00"),
            },
            {
              startDate: new Date("2024-12-09T11:15:00"),
              endDate: new Date("2024-12-09T11:30:00"),
            }],
          date: addDays(from, 1)
        }, {
          availabilities: [
            {
              startDate: new Date("2024-12-13T13:00:00"),
              endDate: new Date("2024-12-13T13:15:00"),
            },
            {
              startDate: new Date("2024-12-13T13:40:00"),
              endDate: new Date("2024-12-13T13:55:00"),
            }],
          date: addDays(from, 5)
        }, {
          availabilities: [],
          date: addDays(from, 8)
        }, {
          availabilities: [
            {
              startDate: new Date("2024-12-20T13:00:00"),
              endDate: new Date("2024-12-20T13:15:00"),
            }, {
              startDate: new Date("2024-12-20T13:15:00"),
              endDate: new Date("2024-12-20T13:30:00"),
            }, {
              startDate: new Date("2024-12-20T13:30:00"),
              endDate: new Date("2024-12-20T13:45:00"),
            }, {
              startDate: new Date("2024-12-20T13:45:00"),
              endDate: new Date("2024-12-20T14:00:00"),
            },],
          date: addDays(from, 12)
        },
      ]
      expect(result).toEqual(expectedResult)
    });
  });

  describe('getNextAvailability', () => {
    it('should return the next availability', async () => {
      const from = new Date("2024-12-08T12:00:00");
      const schedules: Schedule[] = [
        {
          days: ["Wednesday"],
          startTime: "07:00",
          endTime: "18:00",
          healthProfessionalId: 1
        }
      ];
      const appointments: Appointment[] = [
        {
          startDate: new Date("2024-12-11T7:00:00"),
          endDate: new Date("2024-12-11T12:00:00"),
          healthProfessionalId: 1
        }
      ];

      scheduleMock.findAllForHP.mockResolvedValue(schedules);
      appointmentMock.findAllForHP.mockResolvedValue(appointments);

      const result: Availability = await service.getNextAvailability(from);
      expect(result).toEqual({
        startDate: new Date("2024-12-11T12:00:00"),
        endDate: new Date("2024-12-11T12:15:00")
      });
    });
  });
});
