import mongoose from "mongoose"; // Mongoose is an ODM (Object Data Modeling) library for MongoDB. MongoDB stores data as JSON-like documents. Mongoose lets you: define schemas, create models, validate data, query DB easily. Without Mongoose, you’d use raw MongoDB driver (more complex)
import bcrypt from "bcryptjs"; // bcrypt library is used to hash passwords and compare passwords. Hashed passwords are stored in database instead of storing passwords directly

// Create schema called userSchema. Schema defines fields, data types, validation rules
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true, // Removes leading/trailing spaces
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/.+\@.+\..+/, "Please enter a valid email address!"], // Must contain '@' and '.'
    },
    password: {
        type: String, // Even though this says String, actual value stored is bcrypt hash
        required: true,
        minLength: 6,
    },
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer",
    },
},
{ timestamps: true } // Automatically adds createdAt and updatedAt
);

// Password hash middleware that will hash the password before saving it in our database
// pre is a mongoose middleware that runs before the 'save' event. We run this function before saving a user to DB
// Arrow function is not used here because we cannot bind 'this' in arrow functions
userSchema.pre("save", async function () {
    if (!this.isModified("password")) { // 'password' is the field in concern
        return; // If password is not modified, proceed to the next middleware or save operation. Why? When updating user profile (name, email). You don’t want to re-hash the already-hashed password. 'this' refers to the current user document
    }
    const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds of processing. Higher the number, more security, but slower. 10 is a good balance
    this.password = await bcrypt.hash(this.password, salt); // Hash the password using the generated salt
});

// Match user entered password to hashed password in database. Returns 'true' if passwords match
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

export default mongoose.model("User", userSchema);