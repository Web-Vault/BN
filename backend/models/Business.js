import mongoose from "mongoose";

const businessSchema = mongoose.Schema(
        {
                name: { type: String },
                // industry: { type: String },
                bio: { type: String },
                location: { type: String },
                businessEmail: { type: String, unique: true },
                businessContactNumber: { type: String },
                CreatorName: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        }, {
        timestamps: true,
}
);

export default mongoose.model("businesses", businessSchema);