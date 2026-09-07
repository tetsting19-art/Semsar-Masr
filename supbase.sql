-- Create Users Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    balance NUMERIC DEFAULT 500000,
    net_worth NUMERIC DEFAULT 500000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create User Portfolio Properties Table
CREATE TABLE IF NOT EXISTS public.user_properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    instance_id TEXT NOT NULL UNIQUE,
    property_id TEXT NOT NULL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    purchase_price NUMERIC NOT NULL,
    current_value NUMERIC NOT NULL,
    is_rented BOOLEAN DEFAULT FALSE,
    rent_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Transactions History Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    details TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    profit_loss NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for User Properties
CREATE POLICY "Users can view their own properties" 
    ON public.user_properties FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own properties" 
    ON public.user_properties FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties" 
    ON public.user_properties FOR DELETE USING (auth.uid() = user_id);

-- Leaderboard Public Read Policy
CREATE POLICY "Anyone can view leaderboard profiles"
    ON public.profiles FOR SELECT USING (true);
