#
# A script to autogenerate entries in the main feed from the Simplecast API
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

counter = 0
# fetch existing titles
existing_episodes = Dir["./_posts/*"].map {|e| e.gsub(/.\/_posts\/\d{4}-\d{2}-\d{2}-/, '')
                                            .gsub('.md', '')}

JSON.parse(response.body).each do |episode|
  next unless episode['published']
  # check if it exists, we can't do the exact path matching,
  # Simplecast was returning inconsistent dates
  title = episode['title']
  next if existing_episodes.include? title

  # generate file name
  date = Date.parse episode['published_at']
  file_name = "./_posts/#{date}-#{title}.md"

  # write file from template
  File.binwrite(file_name, <<STRING)
---
layout: episode_v2
simplecastId: #{episode['id']}
title: "#{title}"
sharing_token: "#{episode['sharing_url'].split('/').last}"
---

#{episode['description']}
STRING

  counter += 1
  puts "Added #{file_name}"
end
puts "#{counter} episodes added"
exit(0) if counter > 0
exit(100)

