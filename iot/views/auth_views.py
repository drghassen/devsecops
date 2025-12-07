"""
Authentication views (login, logout)
"""
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages


def login_view(request):
    """Handle user login"""
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            # Set flag to show welcome message
            request.session['show_welcome'] = True
            messages.success(request, f'Bienvenue, {user.username} !')
            return redirect('dashboard')
        else:
            messages.error(request, 'Nom d\'utilisateur ou mot de passe incorrect.')
    
    return render(request, 'iot/login.html')


def logout_view(request):
    """Handle user logout"""
    logout(request)
    messages.info(request, 'Vous avez été déconnecté.')
    return redirect('login')
