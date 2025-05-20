import mongoose from "mongoose";

const userSchema = mongoose.Schema(
        {
                userImage: { type: String },
                userName: { type: String, required: true },
                userEmail: { type: String, required: true, unique: true },
                userPassword: { type: String, required: true },
                industry: { type: String },
                isSeeker: { type: Boolean },
                groupJoined: {
                        Joined: { type: Boolean },
                        JoinedGroupId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
                },
                website: { type: String },
                location: { type: String },
                mobileNumber: { type: String },
                bio: { type: String },
                referralCode: { type: String },

                // 
                connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],

        }, {
        timestamps: true,
}
);

// Create a sparse unique index for referralCode
userSchema.index({ referralCode: 1 }, { unique: true, sparse: true });

export default mongoose.model("users", userSchema);