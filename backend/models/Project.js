import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
        maxlength: [200, 'Project title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Project description is required']
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teamMembers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: String,
        startDate: Date,
        endDate: Date
    }],
    timeline: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        milestones: [{
            title: String,
            description: String,
            dueDate: Date,
            status: {
                type: String,
                enum: ['Pending', 'In Progress', 'Completed', 'Delayed'],
                default: 'Pending'
            },
            completedDate: Date
        }]
    },
    budget: {
        estimated: { type: Number, required: true },
        actual: Number,
        expenses: [{
            description: String,
            amount: Number,
            date: Date,
            category: String
        }]
    },
    status: {
        type: String,
        enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'],
        default: 'Planning'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    documents: [{
        name: String,
        type: String,
        uploadDate: { type: Date, default: Date.now },
        fileUrl: String,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    tags: [String]
}, {
    timestamps: true
});

export default mongoose.model('Project', projectSchema);