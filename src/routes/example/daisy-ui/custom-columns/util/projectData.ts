import { faker } from '@faker-js/faker';
import { createExampleData } from '../../../util/exampleDataUtil.js';

export type ProjectStatus = 'planning' | 'active' | 'review' | 'shipped';

export interface Project {
    id: number;
    name: string;
    owner: {
        firstName: string;
        lastName: string;
    };
    status: ProjectStatus;
    progress: number;
    budget: number;
    dueAt: Date;
}

const statuses: ProjectStatus[] = ['planning', 'active', 'review', 'shipped'];

let idCounter = 1;

export const exampleProjectList = createExampleData<Project>(
    () => {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const progress =
            status === 'shipped' ? 100 : status === 'planning' ? Math.round(Math.random() * 20) : Math.round(Math.random() * 80) + 10;

        return {
            id: idCounter++,
            name: faker.company.catchPhrase(),
            owner: {
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName()
            },
            status,
            progress,
            budget: faker.number.int({ min: 1_000, max: 250_000 }),
            dueAt: faker.date.between({
                from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                to: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)
            })
        };
    },
    { min: 60, max: 120 }
);
