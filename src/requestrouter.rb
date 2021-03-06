require 'abstracthandler'

module StreamRoller

  class RequestRouter
    def initialize(toolman = nil)
      #if toolman is nil, no toolmanager and therefore no tools are available,
      #limiting available handler to likely just passthroughs

      if toolman.nil?
        available_tools = []
      else
        available_tools = toolman.available_tools
      end

      @handlers = Hash.new {|h,k| h[k] = []}
      @mappings = Hash.new {|h,k| h[k] = []}

      conf_handlers = $config["handlers"]

      RequestHandler::AbstractHandler.defined_handlers.each do |h|
        #handlers must have a configuration name
        next if h.config_name.nil?

        #unmentioned handlers are passed
        next if conf_handlers[h.config_name].nil?

        #handler must be enabled
        next if conf_handlers[h.config_name]["enabled"].nil? or conf_handlers[h.config_name]["enabled"] == false

        config = h.default_config.clone

        config.merge!(conf_handlers[h.config_name])

        #determine if the required tools are a subset of the available tools

        cont = true
        h.required_tools.each do |t|
          if !available_tools.include?(t)
            cont = false
            break
          end
        end

        next unless cont

        @handlers[h.supported_input] << h.new(toolman, config)
        @mappings[h.supported_input] << h.supported_output

      end

      @handlers.each do |k,v|
        #decending order
        v.sort!{|a,b| b.priority <=> a.priority}
      end
    end

    def handled_mimetypes
      return @handlers.keys
    end

    def mimetype_mappings
      @mappings
    end

    def route(sinatra_response)
      r = $db[:songs].filter(:id => sinatra_response.params[:id]).first()
      puts "#{Time.new.strftime("%m/%d %H:%M:%S")} #{sinatra_response.request.env['REMOTE_ADDR']}: #{( (r[:id3_artist] && r[:id3_title] ) ? "#{r[:id3_artist]} - #{r[:id3_title]}" : r[:file])}"
      throw RuntimeError("Unhandled mimetype! How did this happen?") unless handled_mimetypes.include?(r[:mimetype])

      @handlers[r[:mimetype]].each do |h|
        p = h.handle_request(sinatra_response, r)
        return p unless p.nil?
      end

      puts "None of the registered handlers for #{r[:mimetype]} actually handled; user agent was #{sinatra_response.request.user_agent}"
      sinatra_response.halt 415
    end
  end
end

list = Dir.entries("src/request_handlers")

list.each do |r|
  ext = r[/(?:.*\.)(.*$)/, 1]
  if ext == "rb" or ext == "class"
    require "request_handlers/#{r}"
  end
end
