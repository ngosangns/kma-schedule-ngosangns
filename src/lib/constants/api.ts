/**
 * API Constants for KMA Schedule Application
 *
 * This file contains all API-related constants including endpoints,
 * base URLs, and configuration values.
 */

// KMA Server Configuration
export const KMA_CONFIG = {
	BASE_URL: 'http://qldt.actvn.edu.vn/',
	PATHS: {
		LOGIN: 'CMCSoft.IU.Web.info/Login.aspx',
		SUBJECT: 'CMCSoft.IU.Web.Info/Reports/Form/StudentTimeTable.aspx'
	}
} as const;

// Internal API Endpoints (Next.js API routes)
export const API_ENDPOINTS = {
	LOGIN: '/api/kma/login',
	SUBJECT: '/api/kma/subject'
} as const;

// HTTP Headers
export const DEFAULT_HEADERS = {
	USER_AGENT:
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
	ACCEPT: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	ACCEPT_LANGUAGE: 'vi-VN,vi;q=0.9,en;q=0.8',
	ACCEPT_ENCODING: 'gzip, deflate',
	CONNECTION: 'keep-alive',
	UPGRADE_INSECURE_REQUESTS: '1'
} as const;

// Cache Control Headers
export const CACHE_HEADERS = {
	NO_CACHE: {
		'Cache-Control': 'no-cache, no-store, must-revalidate',
		Pragma: 'no-cache',
		Expires: '0'
	}
} as const;

// Content Types
export const CONTENT_TYPES = {
	HTML: 'text/html; charset=utf-8',
	FORM_URLENCODED: 'application/x-www-form-urlencoded',
	JSON: 'application/json',
	PLAIN_TEXT: 'text/plain'
} as const;

// Authentication
export const AUTH_CONFIG = {
	BEARER_PREFIX: 'Bearer ',
	COOKIE_PATTERN: /SignIn=(.+?);/,
	TOKEN_HEADER: 'Authorization'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
	FETCH_LOGIN_PAGE_FAILED: 'Failed to fetch login page from KMA server',
	AUTHENTICATION_FAILED: 'Failed to authenticate with KMA server',
	FETCH_SUBJECT_DATA_FAILED: 'Failed to fetch subject data from KMA server',
	POST_SUBJECT_DATA_FAILED: 'Failed to post subject data to KMA server',
	AUTH_TOKEN_REQUIRED: 'Authentication token required',
	INVALID_KMA_RESPONSE: 'KMA server responded with invalid status'
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
	OK: 200,
	UNAUTHORIZED: 401,
	INTERNAL_SERVER_ERROR: 500
} as const;
