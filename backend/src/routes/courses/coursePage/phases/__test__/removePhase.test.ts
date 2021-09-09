/** @format */

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../../../../app';
import { UserTypes } from '../../../../../library';

const path = '/api/course';

it('Returns a 401 if user is not authenticated', async () => {});

it('Returns a 401 if user is not a teacher or admin', async () => {});

it('Returns a 400 if the id to remove phase is not an ObjectId', async () => {});

it('Returns a 200 on successfully removing phase', async () => {});

it('upForDeletion is a date', async () => {});
