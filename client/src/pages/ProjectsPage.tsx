import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Layout from '../components/layout/Layout';
import ProjectCard from '../components/common/ProjectCard';
import EmptyState from '../components/common/EmptyState';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { projectAPI, Project } from '../api/project.api';
import { useToast } from '../components/ui/toast';

const ProjectsPage: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        const filtered = projects.filter(
            (project) =>
                project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.technologies.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredProjects(filtered);
    }, [searchQuery, projects]);

    const fetchProjects = async () => {
        try {
            const data = await projectAPI.getAllProjects();
            setProjects(data);
            setFilteredProjects(data);
        } catch (error: any) {
            showToast('error', 'Failed to load projects');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold mb-2">Browse Projects</h1>
                    <p className="text-muted-foreground mb-8">
                        Discover amazing student projects from our community
                    </p>

                    {/* Search Bar */}
                    <div className="mb-8">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search projects, subjects, or technologies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Projects Grid */}
                    {isLoading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <Skeleton className="h-48 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            ))}
                        </div>
                    ) : filteredProjects.length > 0 ? (
                        <motion.div
                            layout
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filteredProjects.map((project, index) => (
                                <motion.div
                                    key={project._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    layout
                                >
                                    <ProjectCard project={project} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <EmptyState
                            title="No projects found"
                            description={
                                searchQuery
                                    ? 'Try adjusting your search query'
                                    : 'No projects have been uploaded yet'
                            }
                        />
                    )}
                </motion.div>
            </div>
        </Layout>
    );
};

export default ProjectsPage;
