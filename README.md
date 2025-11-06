<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nvn Arya Blog - Insights from a Working Professional</title>
    <!-- Load Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Load Inter Font -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        /* Custom Tailwind Configuration */
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary-dark': '#111827', /* Dark Grey/Black for background */
                        'primary-light': '#F9FAFB', /* Light Grey for cards */
                        'accent-blue': '#1D4ED8', /* Deep Blue for accents */
                        'accent-teal': '#14B8A6', /* Red for highlights */
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    boxShadow: {
                        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
                    }
                }
            }
        }
        /* Ensure smooth scrolling when hash changes */
        html { scroll-behavior: smooth; }
        .page-content {
            min-height: calc(100vh - 128px); /* Full height minus header and footer */
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
        }
        .page-content.active {
            opacity: 1;
        }
    </style>
</head>
<body class="bg-gray-100 font-sans text-gray-800">

    <!-- Header and Navigation (Fixed) -->
    <header class="sticky top-0 z-50 bg-primary-dark shadow-lg">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <!-- Logo/Title -->
            <a href="#home" onclick="navigate('home')" class="text-2xl font-extrabold text-white tracking-tight hover:text-accent-teal transition duration-300 rounded-lg p-2">
                NVN ARYA <span class="text-accent-blue">BLOG</span>
            </a>

            <!-- Desktop Navigation -->
            <nav class="hidden md:flex space-x-6">
                <a href="#home" onclick="navigate('home')" class="text-white hover:text-accent-teal font-semibold px-3 py-2 rounded-lg transition duration-300">Home</a>
                <a href="#about" onclick="navigate('about')" class="text-white hover:text-accent-teal font-semibold px-3 py-2 rounded-lg transition duration-300">About Me</a>
                <a href="#contact" onclick="navigate('contact')" class="text-white hover:text-accent-teal font-semibold px-3 py-2 rounded-lg transition duration-300">Contact</a>
            </nav>

            <!-- Mobile Menu Button (Hamburger) -->
            <button id="mobile-menu-button" class="md:hidden text-white focus:outline-none">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
        </div>

        <!-- Mobile Menu (Dropdown) -->
        <div id="mobile-menu" class="hidden md:hidden bg-gray-900 border-t border-gray-700">
            <a href="#home" onclick="navigate('home'); toggleMobileMenu()" class="block text-white hover:bg-gray-700 px-4 py-3 font-medium">Home</a>
            <a href="#about" onclick="navigate('about'); toggleMobileMenu()" class="block text-white hover:bg-gray-700 px-4 py-3 font-medium">About Me</a>
            <a href="#contact" onclick="navigate('contact'); toggleMobileMenu()" class="block text-white hover:bg-gray-700 px-4 py-3 font-medium">Contact</a>
        </div>
    </header>

    <!-- Main Content Area -->
    <main id="app" class="container mx-auto px-4 sm:px-6 lg:px-8 py-8"></main>

    <!-- Footer -->
    <footer class="bg-primary-dark mt-12">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-white text-center">
            <p>&copy; <span id="current-year"></span> Navin Arya Blog. All rights reserved.</p>
            <div class="mt-2 text-sm text-gray-400">
                <span class="mr-4">Location: Jaipur</span> |
                <span class="mx-4">Mobile: 9928294545</span> |
                <span class="ml-4">Email: navinarya.786@gmail.com</span>
            </div>
            <p class="text-xs mt-1 text-gray-500">Working Professional's Insights & Analysis</p>
        </div>
    </footer>

    <!-- JavaScript for SPA Logic and Content -->
    <script>
        const app = document.getElementById('app');
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');

        // --- Data Layer (The 10 Pages of Content) ---
        const navinDetails = {
            name: "Navin Arya",
            role: "Working Professional",
            location: "Jaipur, India",
            mobile: "1234567890",
            email: "example@s.com",
            bio: "I am a dedicated working professional based in Jaipur, passionate about **technology, leadership, and personal finance**. I use this blog to share insights gained from over a decade in the industry, focusing on practical advice, market trends, and strategies for career growth. My goal is to synthesize complex ideas into clear, actionable advice.",
            expertise: ["Strategic Planning", "Project Management", "Financial Modeling", "Technology Adoption", "Team Leadership"]
        };

        const blogData = [
            // Post 1 (Page 4)
            { id: 1, title: "The 80/20 Rule for Career Growth", date: "Oct 25, 2025", category: "Productivity", slug: "80-20-career-growth",
              summary: "Applying the Pareto Principle to focus on the 20% of efforts that yield 80% of career results.",
              content: [
                "The Pareto Principle, or the 80/20 rule, is not just for business; it's a powerful framework for career development. We often spread our time thinly across many tasks, but true growth comes from identifying and prioritizing the **high-leverage activities**.",
                "In a professional context, this 20% might include mastering a critical technical skill, networking with key stakeholders, or leading a high-impact project. The 80% often includes routine meetings, low-priority emails, or tasks that can be delegated or automated.",
                "**Actionable Takeaway:** Dedicate 2 hours each week to one high-leverage skill. Track its impact over a quarter. You'll be surprised how quickly you accelerate past colleagues focusing on sheer volume of work.",
                "This principle demands ruthless prioritization. If an activity doesn't directly contribute to your major career objectives, it should be minimized or eliminated."
            ]},
            // Post 2 (Page 5)
            { id: 2, title: "Demystifying Modern Cloud Architecture", date: "Oct 18, 2025", category: "Technology", slug: "modern-cloud-architecture",
              summary: "A breakdown of serverless, microservices, and the future of scalable applications.",
              content: [
                "Cloud computing has moved beyond simple virtual machines. Today's modern applications rely on concepts like **microservices** and **serverless computing** to achieve unprecedented scalability and resilience.",
                "Microservices break down large applications into smaller, independent services that communicate via APIs. This allows teams to iterate faster and deploy features without affecting the entire system. Think of it as replacing a large, monolithic house with many small, specialized workshops.",
                "Serverless doesn't mean no servers; it means managing servers is abstracted away. Platforms like AWS Lambda or Azure Functions let you focus solely on the code. This is transformative for cost-efficiency and agility, especially for event-driven workloads.",
                "The primary challenge lies in monitoring and managing distributed tracing across these complex architectures. Robust observability tools are now non-negotiable for any successful cloud deployment."
            ]},
            // Post 3 (Page 6)
            { id: 3, title: "Financial Freedom: Building a 'Mochi' Portfolio", date: "Oct 10, 2025", category: "Finance", slug: "mochi-portfolio",
              summary: "Introducing the 'Mochi' portfolio strategy: sticky, flexible, and resilient.",
              content: [
                "A 'Mochi' portfolio—named after the Japanese rice cake—is sticky (holds its value), flexible (can adapt to market conditions), and resilient (bounces back from volatility). It’s an approach designed for long-term growth and stability, ideal for a working professional.",
                "This strategy typically advocates for a core allocation of **60% diversified, low-cost index funds**, 25% stable bonds or fixed-income assets, and a 15% 'growth' bucket for high-risk/high-reward investments like individual stocks or emerging markets.",
                "The key is **automatic rebalancing**. When the 60% stock portion grows to 65% in a bull run, you sell the excess 5% and buy more bonds, enforcing discipline and selling high/buying low automatically. This takes the emotion out of investing.",
                "For working professionals, consistency is king. Automate your monthly contributions and ignore the daily noise. Time in the market beats timing the market, always."
            ]},
            // Post 4 (Page 7)
            { id: 4, title: "Leadership vs. Management: The Critical Difference", date: "Sep 28, 2025", category: "Leadership", slug: "leadership-vs-management",
              summary: "Understanding the subtle but profound distinction between managing tasks and leading people.",
              content: [
                "While often used interchangeably, leadership and management are distinct disciplines. Management is about administering, maintaining, and controlling processes; leadership is about innovation, vision, and inspiring trust.",
                "A manager organizes resources and ensures tasks are completed efficiently. A leader defines the future, articulates *why* the task matters, and motivates the team to overcome obstacles they didn't anticipate.",
                "The transition from manager to leader is the most challenging pivot in a professional career. It requires shifting your focus from 'How was the task completed?' to 'What is the vision we are building?' and fostering autonomy in your team.",
                "**Leading is listening.** True leaders spend less time giving instructions and more time understanding the challenges and aspirations of their team members. They create more leaders, not more followers."
            ]},
            // Post 5 (Page 8)
            { id: 5, title: "Jaipur's Evolving Tech Ecosystem", date: "Sep 15, 2025", category: "Local Insight", slug: "jaipur-tech-ecosystem",
              summary: "An overview of the rapid growth and future potential of the IT and startup scene in the Pink City.",
              content: [
                "Jaipur is quickly transitioning from a tourism hub to a burgeoning Tier-2 tech powerhouse. Driven by strong government support, affordable living, and a growing talent pool from local universities, the city is attracting significant investment.",
                "The focus areas are emerging: EdTech, SaaS (Software as a Service), and e-commerce logistics. The supportive infrastructure, including co-working spaces and mentorship networks, is robust, creating a fertile ground for new ventures.",
                "One key challenge remains: retaining senior talent who often migrate to metro cities. However, the quality of life and lower operational costs are increasingly balancing this equation, making it an attractive base for remote operations and smaller product companies.",
                "I believe the next decade will cement Jaipur's role as a major contributor to India's digital economy, especially as remote work becomes the norm."
            ]},
            // Post 6 (Page 9)
            { id: 6, title: "Mastering Asynchronous Communication", date: "Sep 1, 2025", category: "Productivity", slug: "asynchronous-communication",
              summary: "Strategies for effective communication in a remote or hybrid work environment.",
              content: [
                "The shift to hybrid work demands a fundamental change in how we communicate. Relying less on instant response and more on thoughtful, detailed written communication is key to maximizing productivity.",
                "**Asynchronous communication** means sending a message without the expectation of an immediate reply. Tools like Notion, Slack threads, and detailed project documents are central to this. It respects the recipient's focus time.",
                "**Rules for Success:** 1. Write complete, standalone messages (don't send 'hi' and wait). 2. Define clear next steps and deadlines. 3. Summarize complex discussions with key decisions at the top. 4. Use video recordings (loom) for complicated explanations instead of long emails.",
                "This approach reduces 'meeting fatigue,' allows global teams to collaborate efficiently across time zones, and encourages deep, focused work."
            ]},
            // Post 7 (Page 10)
            { id: 7, title: "The Power of the Quarterly Review", date: "Aug 20, 2025", category: "Personal Development", slug: "quarterly-review-power",
              summary: "Why a 90-day personal and professional review cycle beats annual planning.",
              content: [
                "Annual reviews are often too high-level and too far apart to drive real behavioral change. The **Quarterly Review (QR)** is the ideal cadence for a professional to assess progress, pivot strategies, and stay motivated.",
                "A QR involves reviewing three key areas: **Health/Wellbeing**, **Career/Skills**, and **Finance/Investments**. The goal is not just to see *what* happened, but *why* it happened.",
                "During the review, ask hard questions: 'Did I hit my learning goal?', 'Was my time allocation correct?', 'What is the single biggest bottleneck to my success right now?'. Be honest. If you are tracking the wrong metrics, change them.",
                "The output of the QR should be 3-5 clear, measurable goals for the next 90 days. This short feedback loop ensures you are constantly course-correcting toward your long-term vision, making your progress exponential."
            ]}
        ];

        // --- Core Application Logic ---

        const currentPage = { name: 'home', id: null };

        /**
         * Converts the current state to a readable content object.
         * @param {string} pageName - The name of the page to render.
         * @param {number | null} postId - The ID of the post to render (if pageName is 'post').
         */
        function navigate(pageName, postId = null) {
            currentPage.name = pageName;
            currentPage.id = postId;
            render();
            // Update URL hash for sharing/back button
            if (pageName === 'post' && postId) {
                const post = blogData.find(p => p.id === postId);
                window.location.hash = `#post/${post.slug}`;
            } else if (pageName !== 'home') {
                 window.location.hash = `#${pageName}`;
            } else {
                 window.location.hash = `#home`;
            }
            window.scrollTo(0, 0); // Scroll to top on navigation
        }

        /**
         * Main render function: decides which page to display.
         */
        function render() {
            let htmlContent = '';

            switch (currentPage.name) {
                case 'home':
                    htmlContent = renderHome();
                    break;
                case 'about':
                    htmlContent = renderAbout();
                    break;
                case 'contact':
                    htmlContent = renderContact();
                    break;
                case 'post':
                    htmlContent = renderPost(currentPage.id);
                    break;
                default:
                    // Fallback to home page
                    currentPage.name = 'home';
                    htmlContent = renderHome();
            }
            
            // Fade in content
            app.innerHTML = `<div class="page-content">${htmlContent}</div>`;
            setTimeout(() => {
                const contentDiv = app.querySelector('.page-content');
                if(contentDiv) contentDiv.classList.add('active');
            }, 10);
        }

        // --- Page Render Functions ---

        /**
         * Renders the Home/Blog Listing page (Page 1)
         */
        function renderHome() {
            return `
                <section class="text-center py-12 bg-white rounded-xl shadow-lg mb-8">
                    <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl mb-4">
                        Insights from a <span class="text-accent-blue">Working Professional</span>
                    </h1>
                    <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                        Deep dives into Tech, Finance, Leadership, and Productivity.
                    </p>
                </section>

                <section class="py-10">
                    <h2 class="text-3xl font-bold text-gray-900 border-b-2 border-accent-teal pb-2 mb-8">Latest Articles</h2>
                    <div class="grid gap-8 lg:grid-cols-3 md:grid-cols-2">
                        ${blogData.map(post => `
                            <article class="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transform hover:scale-[1.02] transition duration-300 border-t-4 border-accent-blue">
                                <span class="text-xs font-semibold uppercase tracking-wider text-accent-teal">${post.category}</span>
                                <h3 class="mt-2 text-xl font-bold text-gray-900 leading-snug">
                                    <a href="#post/${post.slug}" onclick="navigate('post', ${post.id})" class="hover:text-accent-blue transition duration-300">
                                        ${post.title}
                                    </a>
                                </h3>
                                <p class="mt-4 text-gray-600 text-sm">${post.summary}</p>
                                <div class="mt-4 flex justify-between items-center text-xs text-gray-500">
                                    <span>${post.date}</span>
                                    <button onclick="navigate('post', ${post.id})" class="text-accent-blue hover:text-accent-teal font-semibold flex items-center">
                                        Read Article
                                        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                    </button>
                                </div>
                            </article>
                        `).join('')}
                    </div>
                </section>
            `;
        }

        /**
         * Renders the About Me page (Page 2)
         */
        function renderAbout() {
            return `
                <div class="bg-white p-8 md:p-12 rounded-xl shadow-2xl">
                    <header class="text-center mb-8">
                        <div class="w-24 h-24 mx-auto bg-accent-blue rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                            NA
                        </div>
                        <h1 class="text-4xl font-extrabold text-gray-900">${navinDetails.name}</h1>
                        <p class="text-xl text-accent-blue font-semibold mt-1">${navinDetails.role} | ${navinDetails.location}</p>
                    </header>

                    <section class="mt-8 border-t border-gray-200 pt-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">My Journey & Philosophy</h2>
                        <p class="text-lg text-gray-700 leading-relaxed">${navinDetails.bio}</p>
                    </section>

                    <section class="mt-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Core Expertise</h2>
                        <div class="flex flex-wrap gap-4">
                            ${navinDetails.expertise.map(skill => `
                                <span class="bg-accent-teal/10 text-accent-teal font-medium px-4 py-2 rounded-full text-sm shadow-sm">
                                    ${skill}
                                </span>
                            `).join('')}
                        </div>
                    </section>

                    <section class="mt-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Connect</h2>
                        <div class="flex flex-col space-y-3">
                            <p class="flex items-center text-gray-700">
                                <svg class="w-5 h-5 mr-3 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                Email: <a href="mailto:${navinDetails.email}" class="ml-2 text-accent-teal hover:underline">${navinDetails.email}</a>
                            </p>
                            <p class="flex items-center text-gray-700">
                                <svg class="w-5 h-5 mr-3 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                Mobile: <span class="ml-2 text-gray-700">${navinDetails.mobile}</span>
                            </p>
                        </div>
                    </section>
                </div>
            `;
        }

        /**
         * Renders the Contact page (Page 3)
         */
        function renderContact() {
            return `
                <div class="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-xl shadow-2xl border-t-8 border-accent-teal">
                    <h1 class="text-3xl font-bold text-gray-900 mb-6 text-center">Get In Touch</h1>
                    <p class="text-center text-gray-600 mb-8">
                        I'm always open to discussing industry trends, collaboration opportunities, or general professional inquiries.
                    </p>

                    <div class="grid md:grid-cols-2 gap-10">
                        <!-- Contact Details -->
                        <div>
                            <h2 class="text-xl font-semibold text-accent-blue mb-4">Direct Details</h2>
                            <div class="space-y-4">
                                <div class="flex items-center">
                                    <svg class="w-6 h-6 mr-3 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    <div>
                                        <p class="font-medium">Location</p>
                                        <p class="text-gray-600">${navinDetails.location}</p>
                                    </div>
                                </div>
                                <div class="flex items-center">
                                    <svg class="w-6 h-6 mr-3 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    <div>
                                        <p class="font-medium">Email</p>
                                        <p class="text-gray-600"><a href="mailto:${navinDetails.email}" class="hover:underline">${navinDetails.email}</a></p>
                                    </div>
                                </div>
                                <div class="flex items-center">
                                    <svg class="w-6 h-6 mr-3 text-accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                    <div>
                                        <p class="font-medium">Mobile</p>
                                        <p class="text-gray-600">${navinDetails.mobile}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Contact Form (Mock) -->
                        <div>
                            <h2 class="text-xl font-semibold text-accent-blue mb-4">Send a Message</h2>
                            <form id="contact-form" onsubmit="handleFormSubmit(event)">
                                <div class="mb-4">
                                    <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                                    <input type="text" id="name" name="name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent-blue focus:ring-accent-blue p-2 border" required>
                                </div>
                                <div class="mb-4">
                                    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" id="email" name="email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent-blue focus:ring-accent-blue p-2 border" required>
                                </div>
                                <div class="mb-6">
                                    <label for="message" class="block text-sm font-medium text-gray-700">Message</label>
                                    <textarea id="message" name="message" rows="4" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent-blue focus:ring-accent-blue p-2 border" required></textarea>
                                </div>
                                <button type="submit" class="w-full py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-accent-blue hover:bg-accent-teal transition duration-300 transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue">
                                    Send Message
                                </button>
                                <div id="form-message" class="mt-4 text-center text-sm font-medium hidden p-2 rounded-lg bg-green-100 text-green-700"></div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * Renders a detailed Blog Post (Pages 4 through 10)
         * @param {number} id - The ID of the post.
         */
        function renderPost(id) {
            const post = blogData.find(p => p.id === id);
            if (!post) {
                return `<div class="text-center py-20"><h1 class="text-3xl font-bold text-red-600">Post Not Found</h1><p class="mt-4 text-gray-600">The requested article could not be loaded.</p><button onclick="navigate('home')" class="mt-6 text-accent-blue hover:text-accent-teal font-semibold">Go back to Home</button></div>`;
            }

            return `
                <article class="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-2xl">
                    <span class="text-sm font-semibold uppercase tracking-wider text-accent-teal">${post.category}</span>
                    <h1 class="mt-2 text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">${post.title}</h1>
                    <div class="flex items-center text-gray-500 text-sm mt-3 border-b pb-4 mb-8">
                        <span class="mr-4">By Navin Arya</span>
                        <span>Published: ${post.date}</span>
                    </div>

                    <div class="prose max-w-none text-lg text-gray-700 space-y-6">
                        ${post.content.map(paragraph => `<p>${paragraph}</p>`).join('')}
                    </div>

                    <div class="mt-10 pt-6 border-t border-gray-200">
                         <button onclick="navigate('home')" class="py-2 px-4 border border-accent-blue rounded-lg text-accent-blue hover:bg-accent-blue hover:text-white transition duration-300 font-medium">
                            ← Back to all articles
                        </button>
                    </div>
                </article>
            `;
        }


        // --- Event Handlers and Initialization ---

        /**
         * Handles the mock contact form submission.
         */
        function handleFormSubmit(event) {
            event.preventDefault();
            const formMessage = document.getElementById('form-message');
            formMessage.classList.remove('hidden', 'bg-red-100', 'text-red-700');
            formMessage.classList.add('bg-green-100', 'text-green-700');
            formMessage.textContent = 'Message sent successfully! Navin will get back to you shortly.';
            formMessage.classList.remove('hidden');

            // Clear form (Mock success)
            document.getElementById('contact-form').reset();
            
            // Hide message after 5 seconds
            setTimeout(() => {
                formMessage.classList.add('hidden');
            }, 5000);
        }

        /**
         * Toggles the visibility of the mobile menu.
         */
        function toggleMobileMenu() {
            mobileMenu.classList.toggle('hidden');
        }

        /**
         * Initializes the application based on the URL hash.
         */
        function initializeApp() {
            document.getElementById('current-year').textContent = new Date().getFullYear();

            // Setup mobile menu toggle
            mobileMenuButton.addEventListener('click', toggleMobileMenu);

            // Handle hash changes (browser back/forward buttons)
            window.addEventListener('hashchange', handleHashChange);

            // Initial load
            handleHashChange();
        }

        /**
         * Parses the URL hash to determine the current page.
         */
        function handleHashChange() {
            let hash = window.location.hash.slice(1);
            if (!hash || hash === 'home') {
                navigate('home');
            } else if (hash.startsWith('post/')) {
                // Handle deep links like #post/80-20-career-growth
                const slug = hash.split('/')[1];
                const post = blogData.find(p => p.slug === slug);
                if (post) {
                    navigate('post', post.id);
                } else {
                    navigate('home'); // Fallback
                }
            } else if (['about', 'contact'].includes(hash)) {
                navigate(hash);
            } else {
                 navigate('home'); // Default to home if hash is invalid
            }
        }


        // Start the application
        initializeApp();

    </script>
</body>
</html>
