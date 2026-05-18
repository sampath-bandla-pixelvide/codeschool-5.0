$(document).ready(function() {
    const profileModalHTML = `
    <div class="modal fade" id="modalProfile" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow" style="background:var(--mb-surface); color:var(--mb-text);">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-semibold" style="color:var(--mb-text);">Profile Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="filter: invert(1) brightness(0.7);"></button>
          </div>
          <div class="modal-body pt-4">
            <div class="d-flex gap-4 flex-column flex-md-row">
              <!-- Left: Image Upload -->
              <div class="d-flex flex-column align-items-center" style="width: 200px; flex-shrink: 0;">
                <div style="position:relative; width: 140px; height: 140px; border-radius: 50%; border: 2px solid var(--mb-accent); padding: 4px; margin-bottom: 16px;">
                  <img id="profilePreviewImg" src="" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; background: var(--mb-bg); display:none;">
                  <div id="profileInitials" style="width: 100%; height: 100%; border-radius: 50%; background: rgba(233,69,96,0.2); display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: 800; color: var(--mb-accent);"></div>
                </div>
                <form id="formProfileImage">
                    <label class="btn-nav-outline" style="cursor:pointer; width:100%; justify-content:center; font-size: 0.8rem;">
                        <i class="bi bi-camera"></i> Change Photo
                        <input type="file" id="profileImageInput" accept="image/jpeg, image/png, image/webp" style="display:none;">
                    </label>
                </form>
              </div>
              <!-- Right: Forms -->
              <div class="flex-grow-1" style="max-width: 100%;">
                <div class="d-flex justify-content-end mb-3">
                    <button type="button" id="btnEditProfile" class="btn btn-sm" style="background:rgba(233,69,96,0.1); color:var(--mb-accent); border:1px solid rgba(233,69,96,0.2); border-radius:8px; font-weight:700;"><i class="bi bi-pencil me-1"></i> Edit Details</button>
                </div>
                <form id="formProfileDetails" novalidate>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label style="font-size: 0.75rem; font-weight: 700; color: var(--mb-muted); text-transform: uppercase; margin-bottom: 6px;">First Name</label>
                      <input type="text" id="profFirstName" class="form-control" style="background: var(--mb-bg); border: 1.5px solid var(--mb-border); color: var(--mb-text); border-radius: 10px;" required disabled>
                    </div>
                    <div class="col-md-6">
                      <label style="font-size: 0.75rem; font-weight: 700; color: var(--mb-muted); text-transform: uppercase; margin-bottom: 6px;">Last Name</label>
                      <input type="text" id="profLastName" class="form-control" style="background: var(--mb-bg); border: 1.5px solid var(--mb-border); color: var(--mb-text); border-radius: 10px;" required disabled>
                    </div>
                    <div class="col-md-6">
                      <label style="font-size: 0.75rem; font-weight: 700; color: var(--mb-muted); text-transform: uppercase; margin-bottom: 6px;">Phone</label>
                      <input type="text" id="profPhone" class="form-control" style="background: var(--mb-bg); border: 1.5px solid var(--mb-border); color: var(--mb-text); border-radius: 10px;" required disabled>
                    </div>
                    <div class="col-md-6">
                      <label style="font-size: 0.75rem; font-weight: 700; color: var(--mb-muted); text-transform: uppercase; margin-bottom: 6px;">Date of Birth</label>
                      <input type="date" id="profDob" class="form-control" style="background: var(--mb-bg); border: 1.5px solid var(--mb-border); color: var(--mb-text); border-radius: 10px;" required disabled>
                    </div>
                    <div class="col-12 mt-4" id="saveDetailsWrap" style="display:none;">
                      <button type="submit" class="btn w-100" style="background: var(--mb-accent); color: #fff; border-radius: 10px; font-weight: 700; padding: 10px;">Save Details</button>
                      <button type="button" id="btnCancelEdit" class="btn btn-link w-100 mt-2 text-decoration-none" style="color:var(--mb-muted); font-size:0.9rem;">Cancel</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
    const passwordModalHTML = `
    <div class="modal fade" id="modalPassword" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow" style="background:var(--mb-surface); color:var(--mb-text);">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-semibold" style="color:var(--mb-text);">Change Password</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="filter: invert(1) brightness(0.7);"></button>
          </div>
          <div class="modal-body pt-3">
            <form id="formProfilePassword" novalidate>
              <div class="row g-3">
                <div class="col-12">
                  <label style="font-size: 0.75rem; font-weight: 700; color: var(--mb-muted); text-transform: uppercase; margin-bottom: 6px;">Current Password</label>
                  <input type="password" id="profCurrPwd" class="form-control" style="background: var(--mb-bg); border: 1.5px solid var(--mb-border); color: var(--mb-text); border-radius: 10px;" required>
                </div>
                <div class="col-12">
                  <label style="font-size: 0.75rem; font-weight: 700; color: var(--mb-muted); text-transform: uppercase; margin-bottom: 6px;">New Password</label>
                  <input type="password" id="profNewPwd" class="form-control" style="background: var(--mb-bg); border: 1.5px solid var(--mb-border); color: var(--mb-text); border-radius: 10px;" required minlength="8">
                </div>
                <div class="col-12 mt-4">
                  <button type="submit" class="btn w-100" style="background: var(--mb-accent); color: #fff; border-radius: 10px; font-weight: 700; padding: 10px;">Update Password</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    `;
    $("body").append(profileModalHTML);
    $("body").append(passwordModalHTML);
    const token = localStorage.getItem('token');
    if (token) {
        $('#profileDropdownWrap').show();
        $('#loginLink').hide();
        $('#logoutBtn').hide();
        $.ajax({
            url: './api/get_profile.php',
            type: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
            dataType: 'json',
            success: function(res) {
                if(res.status) {
                    const u = res.data;
                    $('#welcomeMsg').text('Hi, ' + u.first_name).removeClass('d-none').addClass('text-white');
                    $('#profFirstName').val(u.first_name);
                    $('#profLastName').val(u.last_name);
                    $('#profPhone').val(u.phone);
                    $('#profDob').val(u.dob);
                    if(u.profile_image) {
                        $('#profileInitials').hide();
                        $('#profilePreviewImg').attr('src', u.profile_image).show();
                        $('#headerProfileIcon').hide();
                        $('#headerProfileImg').attr('src', u.profile_image).show();
                    } else {
                        $('#profileInitials').text(u.first_name.charAt(0).toUpperCase());
                        $('#profileInitials').show();
                        $('#profilePreviewImg').hide();
                        $('#headerProfileIcon').show();
                        $('#headerProfileImg').hide();
                    }
                }
            }
        });
    } else {
        $('#profileDropdownWrap').hide();
    }
    $('#openProfileModal').on('click', function(e) {
        e.preventDefault();
        $('#modalProfile').modal('show');
    });
    $('#openPasswordModal').on('click', function(e) {
        e.preventDefault();
        $('#formProfilePassword')[0].reset();
        $('#modalPassword').modal('show');
    });
    $('#logoutBtnDropdown').on('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        window.location.replace('./index.html');
    });
    let originalProfileData = {};
    $('#btnEditProfile').on('click', function() {
        $('#formProfileDetails input').prop('disabled', false);
        $('#btnEditProfile').hide();
        $('#saveDetailsWrap').show();
        originalProfileData = {
            fn: $('#profFirstName').val(),
            ln: $('#profLastName').val(),
            ph: $('#profPhone').val(),
            db: $('#profDob').val()
        };
    });
    $('#btnCancelEdit').on('click', function() {
        $('#formProfileDetails input').prop('disabled', true);
        $('#btnEditProfile').show();
        $('#saveDetailsWrap').hide();
        $('#profFirstName').val(originalProfileData.fn);
        $('#profLastName').val(originalProfileData.ln);
        $('#profPhone').val(originalProfileData.ph);
        $('#profDob').val(originalProfileData.db);
    });
    $('#formProfileDetails').on('submit', function(e) {
        e.preventDefault();
        const data = {
            first_name: $('#profFirstName').val(),
            last_name: $('#profLastName').val(),
            phone: $('#profPhone').val(),
            dob: $('#profDob').val()
        };
        $.ajax({
            url: './api/update_profile.php',
            type: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            data: data,
            dataType: 'json',
            success: function(res) {
                if(res.status) {
                    Swal.fire({icon: 'success', text: 'Profile updated!', confirmButtonColor: '#e94560'});
                    $('#welcomeMsg').text('Hi, ' + data.first_name);
                    localStorage.setItem('user', data.first_name);
                    $('#formProfileDetails input').prop('disabled', true);
                    $('#btnEditProfile').show();
                    $('#saveDetailsWrap').hide();
                } else {
                    Swal.fire({icon: 'error', text: res.message, confirmButtonColor: '#e94560'});
                }
            }
        });
    });
    $('#formProfilePassword').on('submit', function(e) {
        e.preventDefault();
        const curr = $('#profCurrPwd').val();
        const nwd = $('#profNewPwd').val();
        if (nwd.length < 8) {
            Swal.fire({icon: 'error', text: 'New password must be at least 8 characters.', confirmButtonColor: '#e94560'});
            return;
        }
        $.ajax({
            url: './api/change_password.php',
            type: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            data: { current_password: curr, new_password: nwd },
            dataType: 'json',
            success: function(res) {
                if(res.status) {
                    $('#modalPassword').modal('hide');
                    Swal.fire({icon: 'success', text: 'Password changed successfully. Please login again.', confirmButtonColor: '#e94560'})
                    .then(() => {
                        $('#logoutBtnDropdown').click();
                    });
                } else {
                    Swal.fire({icon: 'error', text: res.message, confirmButtonColor: '#e94560'});
                }
            }
        });
    });
    $('#profileImageInput').on('change', function() {
        const file = this.files[0];
        if(!file) return;
        const formData = new FormData();
        formData.append('profile_image', file);
        Swal.fire({
            title: 'Uploading...',
            didOpen: () => { Swal.showLoading() },
            allowOutsideClick: false
        });
        $.ajax({
            url: './api/upload_profile_image.php',
            type: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            data: formData,
            contentType: false,
            processData: false,
            dataType: 'json',
            success: function(res) {
                if(res.status) {
                    Swal.close();
                    const v = res.data.image_url + '?t=' + new Date().getTime();
                    $('#profileInitials').hide();
                    $('#profilePreviewImg').attr('src', v).show();
                    $('#headerProfileIcon').hide();
                    $('#headerProfileImg').attr('src', v).show();
                    Swal.fire({icon: 'success', text: 'Profile picture updated!', timer:1500, showConfirmButton:false});
                } else {
                    Swal.fire({icon: 'error', text: res.message, confirmButtonColor: '#e94560'});
                }
            },
            error: function() {
                Swal.fire({icon: 'error', text: 'Upload failed', confirmButtonColor: '#e94560'});
            }
        });
    });
});
