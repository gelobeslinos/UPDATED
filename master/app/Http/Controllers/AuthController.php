<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;


class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'companyID' => 'required|string|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'companyID' => $request->companyID,
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['user' => $user]);
    }


    public function login(Request $request)
    {
        // return response()->json($request->all());

        // Log::info('Login Attempt', $request->all());

        $request->validate([
            'companyID' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('companyID', $request->companyID)->first();

        if (!$user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'companyID' => $user->companyID,   
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
