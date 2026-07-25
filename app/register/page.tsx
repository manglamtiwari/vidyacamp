"use client";

export default function RegisterPage() {

    function handleRegisterButton(){
        console.log("Register button clicked");

    }
    return (
        <main className="min-h-screen bg-emerald-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6">
                    Register School
                </h1>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        School Name
                    </label>

                    <input
                        type="text"
                        placeholder="Enter school name"
                        className="w-full border rounded-md p-3"
                    />
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter email"
                            className="w-full border rounded-md p-3"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter password"
                            className="w-full border rounded-md p-3"
                        />
                    </div>
                    <button
                        // className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
                        className="w-full bg-emerald-600 text-white py-3 rounded-md hover:bg-emerald-700"
                        onClick={handleRegisterButton}
                    >
                        Register
                    </button>
                </div>
            </div>
        </main>
    );
}