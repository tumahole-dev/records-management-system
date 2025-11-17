import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
    clientId: {
        type: String,
        required: true,
        unique: true
    },
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    contactPerson: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        position: String
    },
    contactDetails: {
        email: {
            type: String,
            required: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please enter a valid email'
            ]
        },
        phone: { type: String, required: true },
        alternatePhone: String
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    businessDetails: {
        industry: String,
        companySize: String,
        taxId: String,
        website: String
    },
    contracts: [{
        title: String,
        startDate: Date,
        endDate: Date,
        value: Number,
        status: {
            type: String,
            enum: ['Active', 'Expired', 'Terminated', 'Draft'],
            default: 'Draft'
        },
        documentUrl: String
    }],
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended'],
        default: 'Active'
    },
    notes: String,
    assignedManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Client', clientSchema);