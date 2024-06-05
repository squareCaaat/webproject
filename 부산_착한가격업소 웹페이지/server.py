from http.server import SimpleHTTPRequestHandler, HTTPServer

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Access-Control-Allow-Headers', 'x-api-key,Content-Type')
        super().end_headers()

    def do_GET(self):
        if self.path == '/':
            self.path = '/test.html'
        return super().do_GET()

if __name__ == "__main__":
    server_address = ('', 8080)
    httpd = HTTPServer(server_address, CORSRequestHandler)
    print("Serving on port 8080")
    httpd.serve_forever()
