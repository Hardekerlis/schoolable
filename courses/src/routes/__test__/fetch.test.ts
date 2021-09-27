import request from 'supertest';
import faker from 'faker';
import { app } from '../../app';

import { UserTypes } from '@gustafdahl/schoolable-enums';

const path = '/api/course/fetch';

it.todo('Returns a 401 if user is not logged in');

it.todo('Returns a 404 if no courses are found');

it.todo('Returns a 200 if courses are fetched');
