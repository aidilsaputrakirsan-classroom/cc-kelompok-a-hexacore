FROM nginx:1.25-alpine

# Remove default configuration
RUN rm /etc/nginx/nginx.conf

# Copy custom configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
