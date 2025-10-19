// Vercel serverless function wrapper for Express backend
const path = require("path");

// Import the Express app from the compiled backend
const backendPath = path.join(__dirname, "../backend/dist/index.js");
const app = require(backendPath).default || require(backendPath);

// Wrapper to strip /api prefix before passing to Express
module.exports = (req, res) => {
	// Strip /api prefix from the URL path
	req.url = req.url.replace(/^\/api(\/|$)/, "/") || "/";

	// Pass the modified request to Express
	return app(req, res);
};
