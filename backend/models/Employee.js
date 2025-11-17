import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeId: {
        type: String,
        required: true,
        unique: true
    },
    personalDetails: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        dateOfBirth: { type: Date, required: true },
        gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
        contactNumber: { type: String, required: true },
        personalEmail: { type: String, required: true },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        },
        emergencyContact: {
            name: String,
            relationship: String,
            phone: String
        }
    },
    jobDetails: {
        department: { type: String, required: true },
        position: { type: String, required: true },
        hireDate: { type: Date, required: true },
        employmentType: {
            type: String,
            enum: ['Full-time', 'Part-time', 'Contract', 'Temporary'],
            required: true
        },
        salary: { type: Number, required: true },
        manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
        workLocation: String,
        workSchedule: String
    },
    performance: {
        lastReviewDate: Date,
        nextReviewDate: Date,
        overallRating: { type: Number, min: 1, max: 5 },
        strengths: [String],
        areasForImprovement: [String],
        goals: [String]
    },
    documents: [{
        name: String,
        type: String,
        uploadDate: { type: Date, default: Date.now },
        filerUrl: String,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    status: {
        type: String,
        enum: ['Active', 'On Leave', 'Terminated', 'Resigned'],
        default: 'Active'
    }
}, {
    timestamps: true
});

export default mongoose.model('Employee', employeeSchema);