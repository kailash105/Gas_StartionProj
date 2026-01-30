const { onCall } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

exports.createStaffUser = onCall(
    {
        region: "us-central1",
    },
    async (request) => {
        const context = request.auth;
        const data = request.data;

        if (!context) {
            throw new Error("Unauthenticated");
        }

        const adminUid = context.uid;

        const adminDoc = await admin
            .firestore()
            .doc(`users/${adminUid}`)
            .get();

        if (!adminDoc.exists || adminDoc.data().role !== "admin") {
            throw new Error("Only admin can create staff");
        }

        const { email, password, name } = data;

        const userRecord = await admin.auth().createUser({
            email,
            password,
        });

        await admin.firestore().doc(`users/${userRecord.uid}`).set({
            email,
            name: name || "",
            role: "staff",
            createdBy: adminUid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true };
    }
);
