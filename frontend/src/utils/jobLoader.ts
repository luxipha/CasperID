import frontMatter from 'front-matter';

export interface Job {
    slug: string;
    title: string;
    department: string;
    location: string;
    type: string;
    salary: string;
    content: string; // HTML content or raw markdown
}

export async function getAllJobs(): Promise<Job[]> {
    const modules = import.meta.glob('../content/jobs/*.md', { as: 'raw', eager: true });

    const jobs: Job[] = [];

    for (const path in modules) {
        const rawContent = modules[path] as string;
        const { attributes, body } = frontMatter<any>(rawContent);

        jobs.push({
            slug: attributes.slug,
            title: attributes.title,
            department: attributes.department,
            location: attributes.location,
            type: attributes.type,
            salary: attributes.salary,
            content: body
        });
    }

    return jobs;
}

export async function getJobBySlug(slug: string): Promise<Job | undefined> {
    const jobs = await getAllJobs();
    return jobs.find(job => job.slug === slug);
}
