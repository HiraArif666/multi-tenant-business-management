import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { HasPermission } from '../auth/decorators/has-permission.decorator';
import { BusinessUnitGuard } from '../business-units/guards/business-unit.guard';

import { JobSchedulerService } from './job-scheduler.service';
import { CreateJobScheduleDto } from './dto/create-job-schedule.dto';
import { UpdateJobScheduleDto } from './dto/update-job-schedule.dto';

@ApiTags('Job Scheduler')
@ApiBearerAuth()
@Controller('api/job-schedules')
@UseGuards(JwtGuard, BusinessUnitGuard, PermissionGuard)
export class JobSchedulerController {
  constructor(
    private readonly jobSchedulerService: JobSchedulerService,
  ) {}

  @Get()
  @HasPermission('staff.job-scheduler.view')
  @ApiOperation({ summary: 'Get Job Schedules' })
  findAll(@Query() query: any, @Req() req: any) {
    return this.jobSchedulerService.findAll(
      query,
      req.user,
    );
  }

  @Get(':id')
  @HasPermission('staff.job-scheduler.view')
  @ApiOperation({ summary: 'Get Job Schedule by Id' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.jobSchedulerService.findOne(
      id,
      req.user,
    );
  }

  @Post()
  @HasPermission('staff.job-scheduler.add')
  @ApiOperation({ summary: 'Create Job Schedule' })
  create(
    @Body() body: CreateJobScheduleDto,
    @Req() req: any,
  ) {
    return this.jobSchedulerService.create(
      body,
      req.user,
    );
  }

  @Put(':id')
  @HasPermission('staff.job-scheduler.edit')
  @ApiOperation({ summary: 'Update Job Schedule' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateJobScheduleDto,
    @Req() req: any,
  ) {
    return this.jobSchedulerService.update(
      id,
      body,
      req.user,
    );
  }

  @Delete(':id')
  @HasPermission('staff.job-scheduler.delete')
  @ApiOperation({ summary: 'Delete Job Schedule' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.jobSchedulerService.remove(
      id,
      req.user,
    );
  }
}