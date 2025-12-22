"""
Page views for rendering HTML templates
Now using data_utils.py as single source of truth - no duplication!
"""

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .. import data_utils


@login_required
def dashboard(request):
    """Main dashboard view"""
    # Get prepared data from centralized data_utils
    context = data_utils.get_dashboard_data_dict()

    return render(request, "iot/dashboard.html", context)


@login_required
def hardware_view(request):
    """Hardware monitoring view"""
    # Use centralized data preparation
    context = data_utils.get_hardware_data_dict()
    return render(request, "iot/hardware.html", context)


@login_required
def energy_view(request):
    """Energy monitoring view"""
    # Use centralized data preparation
    context = data_utils.get_energy_data_dict()
    return render(request, "iot/energy.html", context)


@login_required
def network_view(request):
    """Network monitoring view"""
    # Use centralized data preparation
    context = data_utils.get_network_data_dict()
    return render(request, "iot/network.html", context)


@login_required
def scores_view(request):
    """Eco scores view"""
    # Use centralized data preparation
    context = data_utils.get_scores_data_dict()
    return render(request, "iot/scores.html", context)


@login_required
def quiz_view(request):
    """Quiz view"""
    return render(request, "iot/quiz.html")
