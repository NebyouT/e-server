import mongoose from "mongoose";
import { Course } from "./models/course.model.js";
import { User } from "./models/user.model.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const sampleCourses = [
    {
        courseTitle: "The Ultimate MERN Stack Development Bootcamp: From Zero to Hero",
        subTitle: "Master the art of full-stack web development using the robust MERN stack technologies",
        description: "Embark on an in-depth journey into full-stack development with MongoDB, Express.js, React.js, and Node.js. Learn how to build scalable, robust, and dynamic web applications from scratch with step-by-step guidance and practical projects.",
        category: "mern stack development",
        courseLevel: "Beginner",
        coursePrice: 99.99,
        courseThumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60",
        isPublished: true
    },
    {
        courseTitle: "Advanced JavaScript Masterclass: Unlock the Full Power of JavaScript",
        subTitle: "Explore cutting-edge JavaScript techniques and concepts for professional developers",
        description: "Gain a deep understanding of advanced JavaScript concepts, including ES6+, asynchronous programming, closures, and design patterns. This course is designed to enhance your coding skills and prepare you for complex real-world applications.",
        category: "javascript",
        courseLevel: "Advance",
        coursePrice: 79.99,
        courseThumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&auto=format&fit=crop&q=60",
        isPublished: true
    },
    {
        courseTitle: "Python for Data Science: Analyze, Visualize, and Innovate",
        subTitle: "Master Python programming for comprehensive data science solutions",
        description: "Delve into the world of data science with this extensive Python course. Learn the essentials of Python, NumPy, and Pandas while gaining expertise in data analysis, visualization, and real-world problem-solving.",
        category: "data science",
        courseLevel: "Medium",
        coursePrice: 89.99,
        courseThumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
        isPublished: true
    },
    {
        courseTitle: "Next.js Full Stack Development: Build Modern Applications with Ease",
        subTitle: "Discover how to create seamless full-stack web applications with Next.js",
        description: "Learn how to harness the power of Next.js to build high-performance, SEO-friendly web applications. This course covers everything from React fundamentals to advanced server-side rendering and database integration with MongoDB.",
        category: "nextjs",
        courseLevel: "Medium",
        coursePrice: 129.99,
        courseThumbnail: "https://images.unsplash.com/photo-1591267990532-e5bdb1b0ceb8?w=800&auto=format&fit=crop&q=60",
        isPublished: true
    },
    {
        courseTitle: "Frontend Development Fundamentals: Create Stunning Web Interfaces",
        subTitle: "A complete beginner's guide to mastering modern frontend development tools and techniques",
        description: "Learn the core principles of frontend development, including HTML, CSS, JavaScript, and React. Build visually appealing, user-friendly web interfaces with hands-on projects and expert insights.",
        category: "frontend development",
        courseLevel: "Beginner",
        coursePrice: 69.99,
        courseThumbnail: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&auto=format&fit=crop&q=60",
        isPublished: true
    },
    {
        courseTitle: "Backend Development with Node.js: Build Scalable and Secure Servers",
        subTitle: "Master backend development by learning Node.js, Express.js, and MongoDB",
        description: "Gain the skills to build and manage powerful backend systems using Node.js. This course covers everything from setting up servers with Express.js to managing data with MongoDB, focusing on scalability and security.",
        category: "backend development",
        courseLevel: "Medium",
        coursePrice: 89.99,
        courseThumbnail: "https://images.unsplash.com/photo-1619410283995-43d9134e7656?w=800&auto=format&fit=crop&q=60",
        isPublished: true
    },
    {
        courseTitle: "Python Programming Masterclass: From Fundamentals to Advanced Concepts",
        subTitle: "Learn Python programming like a pro with this all-in-one course",
        description: "Master Python programming with this comprehensive course covering basics, advanced concepts, and real-world applications. Learn to code efficiently and solve complex problems with Python.",
        category: "python",
        courseLevel: "Beginner",
        coursePrice: 79.99,
        courseThumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=60",
        isPublished: true
    },
    {
        courseTitle: "Docker for Developers: Simplify Application Deployment with Containers",
        subTitle: "Understand container technology to modernize your development workflow",
        description: "Learn how to use Docker to streamline application development and deployment. This course includes hands-on exercises to teach you the fundamentals of containerization, Docker Compose, and image management.",
        category: "docker",
        courseLevel: "Medium",
        coursePrice: 69.99,
        courseThumbnail: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&auto=format&fit=crop&q=60",
        isPublished: true
    }
];


const seedDB = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Course.deleteMany({});
        await User.deleteMany({ role: 'instructor' });
        console.log('Cleared existing data');

        // Create instructor
        const hashedPassword = await bcrypt.hash('password123', 10);
        const instructor = await User.create({
            name: 'Dr. Yared',
            email: 'instructor@example.com',
            password: hashedPassword,
            role: 'instructor'
        });
        console.log('Created instructor user');

        // Add courses with instructor
        const coursesWithCreator = sampleCourses.map(course => ({
            ...course,
            creator: instructor._id
        }));

        await Course.insertMany(coursesWithCreator);
        console.log('Sample courses added successfully');

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
