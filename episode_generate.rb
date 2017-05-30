#
# A script to autogenerate entries in the main feed from the Simplecast API
#
#
#

require 'net/http'
require 'uri'
require 'json'
require 'date'

API_KEY = ENV["SIMPLECAST"]
#CAST_ID = ENV["pie"]
CAST_ID = 2120

uri = URI.parse("https://api.simplecast.com/v1/podcasts/#{CAST_ID}/episodes.json?")
request = Net::HTTP::Get.new(uri)
request.basic_auth(API_KEY, "")

req_options = {
  use_ssl: uri.scheme == "https",
}

response = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
  http.request(request)
end

JSON.parse(response.body).each do |episode|
  # generate file name
  date = Date.parse episode['published_at']
  title = episode['title']
  file_name = "./_posts/#{date}-#{title}.md"

  # check if it exists
  next if File.file?(file_name)

  # write file from template
  File.binwrite(file_name, <<STRING)
---
layout: episode
simplecastId: #{episode['id']}
title: #{title}
---

#{episode['description']}
STRING
end
