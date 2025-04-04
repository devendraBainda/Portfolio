@app.route("/<path:filename>")
def serve_files(filename):
    return send_from_directory(".", filename)  # Serve CSS & JS from the same folder
