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
  Res,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import express from 'express';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { HasPermission } from '../auth/decorators/has-permission.decorator';
import { BusinessUnitGuard } from '../business-units/guards/business-unit.guard';

import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@ApiTags('Expenses')
@ApiBearerAuth()
@Controller('api/expenses')
@UseGuards(JwtGuard, BusinessUnitGuard, PermissionGuard)
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
  ) {}

  @Get()
  @HasPermission('expense.view')
  @ApiOperation({ summary: 'Get Expenses' })
  findAll(@Query() query: any, @Req() req: any) {
    return this.expensesService.findAll(
      query,
      req.user,
    );
  }

  @Get('export')
  @HasPermission('expense.export')
  @ApiOperation({ summary: 'Export Expenses to Excel' })
  async export(
    @Query() query: any,
    @Req() req: any,
    @Res() res: express.Response,
  ) {
    const buffer = await this.expensesService.exportToExcel(
      query,
      req.user,
    );

    res.status(200)
      .set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition':
          'attachment; filename="expenses.xlsx"',
      })
      .send(buffer);
  }

  @Get(':id')
  @HasPermission('expense.view')
  @ApiOperation({ summary: 'Get Expense by Id' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.expensesService.findOne(id, req.user);
  }

  @Post()
  @HasPermission('expense.add')
  @ApiOperation({ summary: 'Create Expense' })
  create(
    @Body() body: CreateExpenseDto,
    @Req() req: any,
  ) {
    return this.expensesService.create(body, req.user);
  }

  @Put(':id')
  @HasPermission('expense.edit')
  @ApiOperation({ summary: 'Update Expense (pending only)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateExpenseDto,
    @Req() req: any,
  ) {
    return this.expensesService.update(
      id,
      body,
      req.user,
    );
  }

  @Delete(':id')
  @HasPermission('expense.delete')
  @ApiOperation({ summary: 'Delete Expense (pending only)' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.expensesService.remove(id, req.user);
  }

  @Post(':id/approve')
  @HasPermission('expense.approve')
  @ApiOperation({ summary: 'Approve Expense' })
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.expensesService.approve(id, req.user);
  }

  @Post(':id/reject')
  @HasPermission('expense.approve')
  @ApiOperation({ summary: 'Reject Expense' })
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.expensesService.reject(id, req.user);
  }
}