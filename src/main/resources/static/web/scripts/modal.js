function modalBootstrap() {
    //bootstrap code for modal
    $('#myModal').on('shown.bs.modal', function () {
        $('#myInput').trigger('focus')
    })
};
