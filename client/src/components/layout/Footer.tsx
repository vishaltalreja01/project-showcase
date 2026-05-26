import React from 'react';
import { Heart, Rocket } from 'lucide-react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                                <Rocket className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-lg">ProjectShowcase</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            A platform for students to showcase their amazing projects and receive valuable feedback from instructors.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <a href="/" className="hover:text-primary transition-colors">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="/projects" className="hover:text-primary transition-colors">
                                    Browse Projects
                                </a>
                            </li>
                            <li>
                                <a href="/login" className="hover:text-primary transition-colors">
                                    Login
                                </a>
                            </li>
                            <li>
                                <a href="/signup" className="hover:text-primary transition-colors">
                                    Get Started
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* About */}
                    <div>
                        <h3 className="font-semibold mb-4">About</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Built with modern technologies: React, TypeScript, Tailwind CSS, Express, and MongoDB.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Made with</span>
                            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                            <span>By Gotam Kumar</span>
                        </div>
                    </div>
                </div>

                <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {currentYear} ProjectShowcase. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
